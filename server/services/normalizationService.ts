export interface NormalizedDeal {
  id: string;
  dealName: string;
  ownerCode: string | null;
  clientCode: string | null;
  dealStatus: string | null;
  closeDate: string | null;
  closureProbability: string | number | null;
  maskedDealValue: number | null;
  tentativeCloseDate: string | null;
  dealStage: string | null;
  productDeal: string | null;
  sector: string | null;
  createdDate: string | null;
  hasMissingCloseDate: boolean;
  hasMissingValue: boolean;
  rawRecord: Record<string, any>;
}

export interface NormalizedWorkOrder {
  id: string;
  dealName: string;
  customerCode: string | null;
  serialNumber: string | null;
  natureOfWork: string | null;
  executionStatus: string | null;
  dataDeliveryDate: string | null;
  dateOfPoLoi: string | null;
  documentType: string | null;
  probableStartDate: string | null;
  probableEndDate: string | null;
  personnelCode: string | null;
  sector: string | null;
  typeOfWork: string | null;
  softwarePlatformDeliverable: string | null;
  amountExclGst: number | null;
  amountInclGst: number | null;
  billedValueExclGst: number | null;
  billedValueInclGst: number | null;
  collectedAmount: number | null;
  amountToBeBilledExclGst: number | null;
  amountToBeBilledInclGst: number | null;
  amountReceivable: number | null;
  arPriorityAccount: boolean;
  invoiceStatus: string | null;
  woStatusBilled: string | null;
  collectionStatus: string | null;
  billingStatus: string | null;
  hasMissingBilledValue: boolean;
  rawRecord: Record<string, any>;
}

export interface DataQualityReport {
  dealsTotal: number;
  dealsMissingValueCount: number;
  dealsMissingCloseDateCount: number;
  dealsCompletenessPercentage: number;
  workOrdersTotal: number;
  workOrdersMissingAmountCount: number;
  workOrdersCompletenessPercentage: number;
  appliedRules: string[];
  caveats: string[];
}

class NormalizationService {
  // Safe helper to normalize nulls and text
  public cleanText(val: any): string | null {
    if (val === undefined || val === null) return null;
    const str = String(val).trim();
    if (!str) return null;
    const lower = str.toLowerCase();
    if (['n/a', 'na', '-', 'unknown', 'null', 'none', 'nan', 'undefined'].includes(lower)) {
      return null;
    }
    return str;
  }

  // Safe helper to normalize currency and numbers
  public cleanNumber(val: any): number | null {
    if (val === undefined || val === null) return null;
    if (typeof val === 'number') {
      return isNaN(val) ? null : val;
    }
    let str = String(val).trim();
    if (!str) return null;
    const lower = str.toLowerCase();
    if (['n/a', 'na', '-', 'unknown', 'null', 'none', 'nan'].includes(lower)) {
      return null;
    }
    // Clean currency symbols, commas, spaces
    str = str.replace(/[^0-9.-]/g, '');
    if (!str) return null;
    const parsed = parseFloat(str);
    return isNaN(parsed) ? null : parsed;
  }

  // Safe helper for dates
  public cleanDate(val: any): string | null {
    const str = this.cleanText(val);
    if (!str) return null;
    
    // Check Excel serial number date format (e.g. 45000)
    if (/^\d{5}$/.test(str)) {
      const excelEpoch = new Date(1899, 11, 30);
      const days = parseInt(str, 10);
      const date = new Date(excelEpoch.getTime() + days * 86400000);
      return date.toISOString().split('T')[0];
    }

    try {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // Return raw string if unparseable
    }
    return str;
  }

  // Normalize Sector names
  public cleanSector(val: any): string | null {
    const raw = this.cleanText(val);
    if (!raw) return 'Unspecified Sector';
    const lower = raw.toLowerCase();
    if (lower.includes('mining')) return 'Mining';
    if (lower.includes('powerline') || lower.includes('power')) return 'Powerline';
    if (lower.includes('service') && lower.includes('spectra')) return 'Service + Spectra';
    if (lower.includes('service') || lower.includes('pure service')) return 'Pure Service';
    if (lower.includes('solar')) return 'Solar';
    if (lower.includes('wind')) return 'Wind';
    if (lower.includes('infrastructure') || lower.includes('infra')) return 'Infrastructure';
    return raw;
  }

  // Normalize Deals List
  public normalizeDeals(rawDeals: any[]): NormalizedDeal[] {
    return rawDeals.map((item, idx) => {
      const dealName = this.cleanText(item['Deal Name'] || item['Deal name masked'] || item['Name']) || `Deal #${idx + 1}`;
      const ownerCode = this.cleanText(item['Owner code'] || item['BD/KAM Personnel code']);
      const clientCode = this.cleanText(item['Client Code'] || item['Customer Name Code']);
      const dealStatus = this.cleanText(item['Deal Status']);
      const closeDate = this.cleanDate(item['Close Date (A)']);
      const closureProbability = item['Closure Probability'] ?? null;
      const maskedDealValue = this.cleanNumber(item['Masked Deal value'] || item['Amount in Rupees (Excl of GST) (Masked)']);
      const tentativeCloseDate = this.cleanDate(item['Tentative Close Date']);
      const dealStage = this.cleanText(item['Deal Stage']);
      const productDeal = this.cleanText(item['Product deal']);
      const sector = this.cleanSector(item['Sector/service'] || item['Sector']);
      const createdDate = this.cleanDate(item['Created Date']);

      const hasMissingCloseDate = !closeDate && !tentativeCloseDate;
      const hasMissingValue = maskedDealValue === null;

      return {
        id: `DEAL-${idx + 1}`,
        dealName,
        ownerCode,
        clientCode,
        dealStatus,
        closeDate,
        closureProbability,
        maskedDealValue,
        tentativeCloseDate,
        dealStage,
        productDeal,
        sector,
        createdDate,
        hasMissingCloseDate,
        hasMissingValue,
        rawRecord: item
      };
    });
  }

  // Normalize Work Orders List
  public normalizeWorkOrders(rawWorkOrders: any[]): NormalizedWorkOrder[] {
    return rawWorkOrders.map((item, idx) => {
      const dealName = this.cleanText(item['Deal name masked'] || item['Deal Name']) || `Work Order #${idx + 1}`;
      const customerCode = this.cleanText(item['Customer Name Code'] || item['Client Code']);
      const serialNumber = this.cleanText(item['Serial #']);
      const natureOfWork = this.cleanText(item['Nature of Work']);
      const executionStatus = this.cleanText(item['Execution Status']);
      const dataDeliveryDate = this.cleanDate(item['Data Delivery Date']);
      const dateOfPoLoi = this.cleanDate(item['Date of PO/LOI']);
      const documentType = this.cleanText(item['Document Type']);
      const probableStartDate = this.cleanDate(item['Probable Start Date']);
      const probableEndDate = this.cleanDate(item['Probable End Date']);
      const personnelCode = this.cleanText(item['BD/KAM Personnel code']);
      const sector = this.cleanSector(item['Sector']);
      const typeOfWork = this.cleanText(item['Type of Work']);
      const softwarePlatformDeliverable = this.cleanText(item['Is any Skylark software platform part of the client deliverables in this deal?']);

      const amountExclGst = this.cleanNumber(item['Amount in Rupees (Excl of GST) (Masked)']);
      const amountInclGst = this.cleanNumber(item['Amount in Rupees (Incl of GST) (Masked)']);
      const billedValueExclGst = this.cleanNumber(item['Billed Value in Rupees (Excl of GST.) (Masked)']);
      const billedValueInclGst = this.cleanNumber(item['Billed Value in Rupees (Incl of GST.) (Masked)']);
      const collectedAmount = this.cleanNumber(item['Collected Amount in Rupees (Incl of GST.) (Masked)']);
      const amountToBeBilledExclGst = this.cleanNumber(item['Amount to be billed in Rs. (Exl. of GST) (Masked)']);
      const amountToBeBilledInclGst = this.cleanNumber(item['Amount to be billed in Rs. (Incl. of GST) (Masked)']);
      const amountReceivable = this.cleanNumber(item['Amount Receivable (Masked)']);
      
      const arPriorityText = this.cleanText(item['AR Priority account']);
      const arPriorityAccount = Boolean(arPriorityText && ['yes', 'true', 'high', '1', 'priority'].includes(arPriorityText.toLowerCase()));

      const invoiceStatus = this.cleanText(item['Invoice Status']);
      const woStatusBilled = this.cleanText(item['WO Status (billed)']);
      const collectionStatus = this.cleanText(item['Collection status']);
      const billingStatus = this.cleanText(item['Billing Status']);

      const hasMissingBilledValue = billedValueExclGst === null && amountExclGst === null;

      return {
        id: `WO-${idx + 1}`,
        dealName,
        customerCode,
        serialNumber,
        natureOfWork,
        executionStatus,
        dataDeliveryDate,
        dateOfPoLoi,
        documentType,
        probableStartDate,
        probableEndDate,
        personnelCode,
        sector,
        typeOfWork,
        softwarePlatformDeliverable,
        amountExclGst,
        amountInclGst,
        billedValueExclGst,
        billedValueInclGst,
        collectedAmount,
        amountToBeBilledExclGst,
        amountToBeBilledInclGst,
        amountReceivable,
        arPriorityAccount,
        invoiceStatus,
        woStatusBilled,
        collectionStatus,
        billingStatus,
        hasMissingBilledValue,
        rawRecord: item
      };
    });
  }

  // Generate Data Quality Report
  public auditDataQuality(deals: NormalizedDeal[], workOrders: NormalizedWorkOrder[]): DataQualityReport {
    const dealsTotal = deals.length;
    const dealsMissingValueCount = deals.filter(d => d.hasMissingValue).length;
    const dealsMissingCloseDateCount = deals.filter(d => d.hasMissingCloseDate).length;
    const dealsValidCount = dealsTotal - dealsMissingValueCount;
    const dealsCompletenessPercentage = dealsTotal > 0 ? Math.round((dealsValidCount / dealsTotal) * 100) : 0;

    const workOrdersTotal = workOrders.length;
    const workOrdersMissingAmountCount = workOrders.filter(w => w.hasMissingBilledValue).length;
    const woValidCount = workOrdersTotal - workOrdersMissingAmountCount;
    const workOrdersCompletenessPercentage = workOrdersTotal > 0 ? Math.round((woValidCount / workOrdersTotal) * 100) : 0;

    const appliedRules = [
      'Cleaned text values by normalizing "N/A", "-", "unknown", and empty strings to null.',
      'Standardized dates into ISO format (YYYY-MM-DD), resolving Excel numeric serial timestamps.',
      'Parsed currency strings by stripping currency symbols and formatting numbers accurately.',
      'Grouped sector variations into unified categories (Mining, Powerline, Service + Spectra, Pure Service, Infrastructure).',
      'Calculated explicit audit indicators for missing valuation and timing dates.'
    ];

    const caveats: string[] = [];
    if (dealsMissingValueCount > 0) {
      caveats.push(`${dealsMissingValueCount} deal records have missing or unstated deal values. Total pipeline calculations reflect valid value records only.`);
    }
    if (dealsMissingCloseDateCount > 0) {
      caveats.push(`${dealsMissingCloseDateCount} deals lack expected close dates, which may impact quarterly timeline forecasting.`);
    }
    if (workOrdersMissingAmountCount > 0) {
      caveats.push(`${workOrdersMissingAmountCount} work orders do not list contract amounts or billed totals.`);
    }

    return {
      dealsTotal,
      dealsMissingValueCount,
      dealsMissingCloseDateCount,
      dealsCompletenessPercentage,
      workOrdersTotal,
      workOrdersMissingAmountCount,
      workOrdersCompletenessPercentage,
      appliedRules,
      caveats
    };
  }
}

export const normalizationService = new NormalizationService();
