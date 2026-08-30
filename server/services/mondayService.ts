import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';

export interface RawDealItem {
  [key: string]: any;
}

export interface RawWorkOrderItem {
  [key: string]: any;
}

export interface ConnectionStatus {
  mode: 'MONDAY_CONNECTED' | 'DEMO_FIXTURE' | 'ERROR';
  isMondayConnected: boolean;
  dealsBoardName: string;
  workOrdersBoardName: string;
  dealsRecordCount: number;
  workOrdersRecordCount: number;
  lastRefreshedAt: string;
  errorMessage?: string;
}

class MondayService {
  private status: ConnectionStatus = {
    mode: 'DEMO_FIXTURE',
    isMondayConnected: false,
    dealsBoardName: 'Deal Funnel Data (Demo Fixture)',
    workOrdersBoardName: 'Work Order Tracker Data (Demo Fixture)',
    dealsRecordCount: 0,
    workOrdersRecordCount: 0,
    lastRefreshedAt: new Date().toISOString()
  };

  private dealsData: RawDealItem[] = [];
  private workOrdersData: RawWorkOrderItem[] = [];

  constructor() {
    this.refreshData();
  }

  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  public async refreshData(): Promise<ConnectionStatus> {
    const token = process.env.MONDAY_API_TOKEN;
    const dealsBoardId = process.env.MONDAY_DEALS_BOARD_ID;
    const woBoardId = process.env.MONDAY_WORK_ORDERS_BOARD_ID;

    // Check if real Monday credentials are configured
    if (token && dealsBoardId && woBoardId && token.trim().length > 10) {
      try {
        await this.fetchFromMondayApi(token.trim(), dealsBoardId.trim(), woBoardId.trim());
        return this.status;
      } catch (err: any) {
        console.warn('Monday API fetch failed, falling back to local Excel fixtures:', err.message);
        this.loadLocalFixtures(`Monday.com API Connection Error: ${err.message}`);
        return this.status;
      }
    } else {
      console.log('Monday API credentials unconfigured in environment; using local Excel fixtures.');
      this.loadLocalFixtures();
      return this.status;
    }
  }

  private async fetchFromMondayApi(token: string, dealsBoardId: string, woBoardId: string): Promise<void> {
    const query = `
      query {
        deals: boards(ids: [${dealsBoardId}]) {
          name
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                value
                column {
                  title
                }
              }
            }
          }
        }
        workOrders: boards(ids: [${woBoardId}]) {
          name
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                value
                column {
                  title
                }
              }
            }
          }
        }
      }
    `;

    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'API-Version': '2023-10'
      },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const data: any = await res.json();
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message || 'Monday GraphQL API returned error');
    }

    const dealsBoard = data.data?.deals?.[0];
    const woBoard = data.data?.workOrders?.[0];

    if (!dealsBoard || !woBoard) {
      throw new Error('One or both specified Monday.com board IDs were not found');
    }

    // Convert Monday API items to standard dictionary records
    this.dealsData = (dealsBoard.items_page?.items || []).map((item: any) => {
      const record: RawDealItem = { 'Deal Name': item.name };
      (item.column_values || []).forEach((col: any) => {
        const colTitle = col.column?.title || col.id;
        record[colTitle] = col.text !== undefined && col.text !== null && col.text !== '' ? col.text : col.value;
      });
      return record;
    });

    this.workOrdersData = (woBoard.items_page?.items || []).map((item: any) => {
      const record: RawWorkOrderItem = { 'Deal name masked': item.name };
      (item.column_values || []).forEach((col: any) => {
        const colTitle = col.column?.title || col.id;
        record[colTitle] = col.text !== undefined && col.text !== null && col.text !== '' ? col.text : col.value;
      });
      return record;
    });

    this.status = {
      mode: 'MONDAY_CONNECTED',
      isMondayConnected: true,
      dealsBoardName: dealsBoard.name || 'Deals Board',
      workOrdersBoardName: woBoard.name || 'Work Orders Board',
      dealsRecordCount: this.dealsData.length,
      workOrdersRecordCount: this.workOrdersData.length,
      lastRefreshedAt: new Date().toISOString()
    };

    console.log(`[MondayService] Successfully fetched ${this.dealsData.length} Deals and ${this.workOrdersData.length} Work Orders from Monday.com API.`);
  }

  private loadLocalFixtures(errorContext?: string): void {
    const dealsPath = path.resolve('..', 'Deal funnel Data.xlsx');
    const woPath = path.resolve('..', 'Work_Order_Tracker Data.xlsx');

    let loadedDealsCount = 0;
    let loadedWoCount = 0;

    if (fs.existsSync(dealsPath)) {
      const wb = xlsx.readFile(dealsPath);
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      this.dealsData = xlsx.utils.sheet_to_json(sheet);
      loadedDealsCount = this.dealsData.length;
    } else {
      this.dealsData = [];
    }

    if (fs.existsSync(woPath)) {
      const wb = xlsx.readFile(woPath);
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rawRows: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      if (rawRows.length > 1) {
        const headers = rawRows[1] as string[];
        const dataRows = rawRows.slice(2);
        this.workOrdersData = dataRows.map((row: any) => {
          const item: RawWorkOrderItem = {};
          headers.forEach((h, idx) => {
            if (h) item[h] = row[idx] !== undefined ? row[idx] : null;
          });
          return item;
        }).filter(item => Object.keys(item).length > 0 && item['Deal name masked']);
        loadedWoCount = this.workOrdersData.length;
      }
    } else {
      this.workOrdersData = [];
    }

    this.status = {
      mode: errorContext ? 'ERROR' : 'DEMO_FIXTURE',
      isMondayConnected: false,
      dealsBoardName: 'Deal Funnel Data (Demo Fixture)',
      workOrdersBoardName: 'Work Order Tracker Data (Demo Fixture)',
      dealsRecordCount: loadedDealsCount,
      workOrdersRecordCount: loadedWoCount,
      lastRefreshedAt: new Date().toISOString(),
      errorMessage: errorContext
    };
  }

  public getRawDeals(): RawDealItem[] {
    return this.dealsData;
  }

  public getRawWorkOrders(): RawWorkOrderItem[] {
    return this.workOrdersData;
  }
}

export const mondayService = new MondayService();
