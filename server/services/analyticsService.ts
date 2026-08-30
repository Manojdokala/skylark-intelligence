import { NormalizedDeal, NormalizedWorkOrder } from './normalizationService.js';

export interface SectorSummary {
  sector: string;
  dealCount: number;
  pipelineValue: number;
  workOrderCount: number;
  billedValue: number;
  unbilledAmount: number;
}

export interface StageSummary {
  stage: string;
  count: number;
  value: number;
}

export interface DealsAnalyticsResult {
  totalDeals: number;
  dealsWithValuesCount: number;
  totalPipelineValue: number;
  averageDealValue: number;
  dealsBySector: SectorSummary[];
  dealsByStage: StageSummary[];
  highProbabilityPipeline: number;
  dealsNeedingAttention: {
    id: string;
    dealName: string;
    clientCode: string | null;
    value: number | null;
    reason: string;
  }[];
}

export interface WorkOrdersAnalyticsResult {
  totalWorkOrders: number;
  totalContractAmountExclGst: number;
  totalBilledValueExclGst: number;
  totalCollectedAmountInclGst: number;
  totalToBeBilledExclGst: number;
  totalAmountReceivable: number;
  executionStatusBreakdown: { status: string; count: number; value: number }[];
  workOrdersBySector: { sector: string; count: number; billedValue: number }[];
  arPriorityCount: number;
  arPriorityTotalReceivable: number;
}

export interface CrossBoardAnalyticsResult {
  commonDimension: string;
  matchedSectorsCount: number;
  crossBoardComparison: {
    sector: string;
    pipelineValue: number;
    dealsCount: number;
    opsBilledValue: number;
    workOrdersCount: number;
    ratioPipelineToOpsBilled: number | null;
  }[];
  dataAvailabilityNote: string;
}

class AnalyticsService {
  // 1. Deals Analytics
  public analyzeDeals(deals: NormalizedDeal[]): DealsAnalyticsResult {
    const totalDeals = deals.length;
    const validDeals = deals.filter(d => d.maskedDealValue !== null && d.maskedDealValue > 0);
    const dealsWithValuesCount = validDeals.length;
    const totalPipelineValue = validDeals.reduce((sum, d) => sum + (d.maskedDealValue || 0), 0);
    const averageDealValue = dealsWithValuesCount > 0 ? Math.round(totalPipelineValue / dealsWithValuesCount) : 0;

    // By Sector
    const sectorMap = new Map<string, { count: number; value: number }>();
    deals.forEach(d => {
      const sec = d.sector || 'Unspecified Sector';
      const existing = sectorMap.get(sec) || { count: 0, value: 0 };
      existing.count += 1;
      existing.value += d.maskedDealValue || 0;
      sectorMap.set(sec, existing);
    });

    const dealsBySector: SectorSummary[] = Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      dealCount: data.count,
      pipelineValue: data.value,
      workOrderCount: 0,
      billedValue: 0,
      unbilledAmount: 0
    })).sort((a, b) => b.pipelineValue - a.pipelineValue);

    // By Stage
    const stageMap = new Map<string, { count: number; value: number }>();
    deals.forEach(d => {
      const stg = d.dealStage || 'Unspecified Stage';
      const existing = stageMap.get(stg) || { count: 0, value: 0 };
      existing.count += 1;
      existing.value += d.maskedDealValue || 0;
      stageMap.set(stg, existing);
    });

    const dealsByStage: StageSummary[] = Array.from(stageMap.entries()).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value
    })).sort((a, b) => b.value - a.value);

    // High probability (probability >= 70% or High status)
    const highProbDeals = deals.filter(d => {
      if (typeof d.closureProbability === 'number') return d.closureProbability >= 0.7;
      if (typeof d.closureProbability === 'string') return d.closureProbability.toLowerCase().includes('high');
      return false;
    });
    const highProbabilityPipeline = highProbDeals.reduce((sum, d) => sum + (d.maskedDealValue || 0), 0);

    // Deals needing attention
    const dealsNeedingAttention = deals.filter(d => {
      return d.hasMissingCloseDate || d.hasMissingValue || (d.dealStatus && d.dealStatus.toLowerCase().includes('stalled'));
    }).slice(0, 5).map(d => ({
      id: d.id,
      dealName: d.dealName,
      clientCode: d.clientCode,
      value: d.maskedDealValue,
      reason: d.hasMissingCloseDate ? 'Missing Close Date' : d.hasMissingValue ? 'Missing Valuation' : 'Stalled Status'
    }));

    return {
      totalDeals,
      dealsWithValuesCount,
      totalPipelineValue,
      averageDealValue,
      dealsBySector,
      dealsByStage,
      highProbabilityPipeline,
      dealsNeedingAttention
    };
  }

  // 2. Work Orders Analytics
  public analyzeWorkOrders(workOrders: NormalizedWorkOrder[]): WorkOrdersAnalyticsResult {
    const totalWorkOrders = workOrders.length;

    const totalContractAmountExclGst = workOrders.reduce((sum, w) => sum + (w.amountExclGst || 0), 0);
    const totalBilledValueExclGst = workOrders.reduce((sum, w) => sum + (w.billedValueExclGst || 0), 0);
    const totalCollectedAmountInclGst = workOrders.reduce((sum, w) => sum + (w.collectedAmount || 0), 0);
    const totalToBeBilledExclGst = workOrders.reduce((sum, w) => sum + (w.amountToBeBilledExclGst || 0), 0);
    const totalAmountReceivable = workOrders.reduce((sum, w) => sum + (w.amountReceivable || 0), 0);

    // Status breakdown
    const statusMap = new Map<string, { count: number; value: number }>();
    workOrders.forEach(w => {
      const st = w.executionStatus || 'Unspecified Status';
      const existing = statusMap.get(st) || { count: 0, value: 0 };
      existing.count += 1;
      existing.value += w.amountExclGst || w.billedValueExclGst || 0;
      statusMap.set(st, existing);
    });

    const executionStatusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      value: data.value
    })).sort((a, b) => b.count - a.count);

    // Sector breakdown
    const woSectorMap = new Map<string, { count: number; billed: number }>();
    workOrders.forEach(w => {
      const sec = w.sector || 'Unspecified Sector';
      const existing = woSectorMap.get(sec) || { count: 0, billed: 0 };
      existing.count += 1;
      existing.billed += w.billedValueExclGst || 0;
      woSectorMap.set(sec, existing);
    });

    const workOrdersBySector = Array.from(woSectorMap.entries()).map(([sector, data]) => ({
      sector,
      count: data.count,
      billedValue: data.billed
    })).sort((a, b) => b.billedValue - a.billedValue);

    // AR Priority
    const arPriorityItems = workOrders.filter(w => w.arPriorityAccount);
    const arPriorityCount = arPriorityItems.length;
    const arPriorityTotalReceivable = arPriorityItems.reduce((sum, w) => sum + (w.amountReceivable || 0), 0);

    return {
      totalWorkOrders,
      totalContractAmountExclGst,
      totalBilledValueExclGst,
      totalCollectedAmountInclGst,
      totalToBeBilledExclGst,
      totalAmountReceivable,
      executionStatusBreakdown,
      workOrdersBySector,
      arPriorityCount,
      arPriorityTotalReceivable
    };
  }

  // 3. Cross-Board Analytics
  public analyzeCrossBoard(deals: NormalizedDeal[], workOrders: NormalizedWorkOrder[]): CrossBoardAnalyticsResult {
    // Valid shared dimension between Deals and Work Orders is "Sector" and "Customer Code"
    const dealSectors = new Map<string, { pipeline: number; count: number }>();
    deals.forEach(d => {
      const sec = d.sector || 'Unspecified Sector';
      const curr = dealSectors.get(sec) || { pipeline: 0, count: 0 };
      curr.pipeline += d.maskedDealValue || 0;
      curr.count += 1;
      dealSectors.set(sec, curr);
    });

    const woSectors = new Map<string, { billed: number; count: number }>();
    workOrders.forEach(w => {
      const sec = w.sector || 'Unspecified Sector';
      const curr = woSectors.get(sec) || { billed: 0, count: 0 };
      curr.billed += w.billedValueExclGst || 0;
      curr.count += 1;
      woSectors.set(sec, curr);
    });

    const allSectors = new Set([...dealSectors.keys(), ...woSectors.keys()]);
    const crossBoardComparison = Array.from(allSectors).map(sec => {
      const dInfo = dealSectors.get(sec) || { pipeline: 0, count: 0 };
      const wInfo = woSectors.get(sec) || { billed: 0, count: 0 };
      const ratio = wInfo.billed > 0 ? parseFloat((dInfo.pipeline / wInfo.billed).toFixed(2)) : null;

      return {
        sector: sec,
        pipelineValue: dInfo.pipeline,
        dealsCount: dInfo.count,
        opsBilledValue: wInfo.billed,
        workOrdersCount: wInfo.count,
        ratioPipelineToOpsBilled: ratio
      };
    }).sort((a, b) => b.pipelineValue - a.pipelineValue);

    return {
      commonDimension: 'Sector / Industry Category',
      matchedSectorsCount: crossBoardComparison.length,
      crossBoardComparison,
      dataAvailabilityNote: 'Cross-board analysis is joined on Sector dimension. Direct Deal ID foreign key mapping between raw Deal Funnel and Work Order Tracker is incomplete in source boards.'
    };
  }
}

export const analyticsService = new AnalyticsService();
