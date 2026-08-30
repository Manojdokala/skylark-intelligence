import { GoogleGenerativeAI } from '@google/generative-ai';
import { mondayService } from './mondayService.js';
import { normalizationService } from './normalizationService.js';
import { analyticsService } from './analyticsService.js';

export interface EvidenceMetadata {
  boardName: string;
  recordsAnalyzed: number;
  validRecordsCount: number;
  calculatedMetrics: Record<string, string | number>;
  lastRefreshedAt: string;
}

export interface ClarificationOption {
  label: string;
  query: string;
}

export interface AgentResponse {
  query: string;
  intent: string;
  isAmbiguous: boolean;
  clarificationOptions?: ClarificationOption[];
  headline: string;
  summaryText: string;
  keyInsights: string[];
  metricsCards: { label: string; value: string; subtext?: string; status?: 'normal' | 'highlight' | 'warning' }[];
  evidence: EvidenceMetadata;
  dataQualityCaveats: string[];
  suggestedFollowUps: string[];
  llmPowered: boolean;
  errorFallbackMessage?: string;
}

class AgentService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 5) {
      this.genAI = new GoogleGenerativeAI(apiKey.trim());
    }
  }

  // Intent Classifier
  private detectIntent(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('brief') || q.includes('leadership') || q.includes('executive summary') || q.includes('founder update')) {
      return 'LEADERSHIP_BRIEF';
    }
    if (q.includes('quality') || q.includes('missing') || q.includes('health') || q.includes('audit')) {
      return 'DATA_QUALITY';
    }
    if (q.includes('cross') || q.includes('compare') || q.includes('sales vs ops') || q.includes('workload vs pipeline') || q.includes('ops vs sales')) {
      return 'CROSS_BOARD_ANALYSIS';
    }
    if (q.includes('work order') || q.includes('ops') || q.includes('operation') || q.includes('execution') || q.includes('billed') || q.includes('invoice') || q.includes('ar priority')) {
      return 'WORK_ORDERS_OVERVIEW';
    }
    if (q.includes('mining') || q.includes('powerline') || q.includes('energy') || q.includes('sector') || q.includes('industry')) {
      return 'SECTOR_PERFORMANCE';
    }
    if (q.includes('pipeline') || q.includes('deal') || q.includes('revenue') || q.includes('stage') || q.includes('close date')) {
      // Check if ambiguous
      if (q.trim() === 'how is our pipeline?' || q.trim() === 'tell me about deals' || q.trim() === 'pipeline status') {
        return 'AMBIGUOUS_PIPELINE';
      }
      return 'PIPELINE_OVERVIEW';
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('help')) {
      return 'GREETING';
    }

    return 'UNSUPPORTED';
  }

  public async processQuery(userQuery: string): Promise<AgentResponse> {
    const status = mondayService.getStatus();
    const rawDeals = mondayService.getRawDeals();
    const rawWorkOrders = mondayService.getRawWorkOrders();

    const deals = normalizationService.normalizeDeals(rawDeals);
    const workOrders = normalizationService.normalizeWorkOrders(rawWorkOrders);
    const dqReport = normalizationService.auditDataQuality(deals, workOrders);

    const intent = this.detectIntent(userQuery);

    // Handle Ambiguous Query
    if (intent === 'AMBIGUOUS_PIPELINE') {
      return {
        query: userQuery,
        intent,
        isAmbiguous: true,
        clarificationOptions: [
          { label: '1. Total Pipeline Value & Overview', query: 'What is our total current pipeline value?' },
          { label: '2. Pipeline by Sector Breakdown', query: 'Which sectors have the strongest pipeline?' },
          { label: '3. Pipeline by Deal Stage', query: 'Breakdown pipeline by deal stage' },
          { label: '4. Deals Needing Attention', query: 'Which deals need attention?' }
        ],
        headline: 'Clarification Needed for Pipeline Analysis',
        summaryText: 'I can analyze the pipeline in a few specific ways. Please choose one of the perspectives below or refine your question:',
        keyInsights: [
          'Total pipeline valuation across all active deals',
          'Sector-wise breakdown (Mining, Powerline, Service + Spectra, etc.)',
          'Pipeline progression by stage',
          'Identification of deals with missing close dates or stalled statuses'
        ],
        metricsCards: [],
        evidence: {
          boardName: status.dealsBoardName,
          recordsAnalyzed: deals.length,
          validRecordsCount: deals.length - dqReport.dealsMissingValueCount,
          calculatedMetrics: { 'Total Deals': deals.length },
          lastRefreshedAt: status.lastRefreshedAt
        },
        dataQualityCaveats: dqReport.caveats,
        suggestedFollowUps: ['What is our total current pipeline value?', 'Which sectors have the strongest pipeline?'],
        llmPowered: false
      };
    }

    // Handle Unsupported Query
    if (intent === 'UNSUPPORTED') {
      return {
        query: userQuery,
        intent,
        isAmbiguous: false,
        headline: 'Query Out of Scope',
        summaryText: 'I can currently analyze pipeline, deals, work orders, sector performance, data quality, and operational metrics from the connected Monday.com boards.',
        keyInsights: [
          'Deals & Sales Pipeline (Valuation, Stages, Sectors, Probabilities)',
          'Work Orders & Operations (Execution status, Billed value, AR priority accounts)',
          'Cross-board Sales vs Operational Workload comparison',
          'Board Data Quality & Data Completeness Audits'
        ],
        metricsCards: [],
        evidence: {
          boardName: `${status.dealsBoardName} & ${status.workOrdersBoardName}`,
          recordsAnalyzed: deals.length + workOrders.length,
          validRecordsCount: deals.length + workOrders.length,
          calculatedMetrics: {},
          lastRefreshedAt: status.lastRefreshedAt
        },
        dataQualityCaveats: [],
        suggestedFollowUps: ['How is our pipeline looking for the energy sector?', 'Compare pipeline with operational workload.'],
        llmPowered: false
      };
    }

    // Handle Supported Analytics Intents
    const dealsAnalytics = analyticsService.analyzeDeals(deals);
    const woAnalytics = analyticsService.analyzeWorkOrders(workOrders);
    const crossAnalytics = analyticsService.analyzeCrossBoard(deals, workOrders);

    let responseData: AgentResponse;

    switch (intent) {
      case 'PIPELINE_OVERVIEW':
        responseData = this.formatPipelineResponse(userQuery, dealsAnalytics, status, dqReport);
        break;
      case 'SECTOR_PERFORMANCE':
        responseData = this.formatSectorResponse(userQuery, dealsAnalytics, woAnalytics, crossAnalytics, status, dqReport);
        break;
      case 'WORK_ORDERS_OVERVIEW':
        responseData = this.formatWorkOrdersResponse(userQuery, woAnalytics, status, dqReport);
        break;
      case 'CROSS_BOARD_ANALYSIS':
        responseData = this.formatCrossBoardResponse(userQuery, crossAnalytics, status, dqReport);
        break;
      case 'LEADERSHIP_BRIEF':
        responseData = this.formatLeadershipBriefResponse(userQuery, dealsAnalytics, woAnalytics, crossAnalytics, status, dqReport);
        break;
      case 'DATA_QUALITY':
        responseData = this.formatDataQualityResponse(userQuery, dqReport, status);
        break;
      default:
        responseData = this.formatPipelineResponse(userQuery, dealsAnalytics, status, dqReport);
    }

    // Optional LLM enhancement if GEMINI_API_KEY is present
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const prompt = `You are an executive Business Intelligence assistant for Skylark Drones.
User Query: "${userQuery}"
Deterministic Analytics Data:
Headline: ${responseData.headline}
Key Insights: ${JSON.stringify(responseData.keyInsights)}
Metrics: ${JSON.stringify(responseData.metricsCards)}
Data Quality Caveats: ${JSON.stringify(responseData.dataQualityCaveats)}

Generate a concise, founder-level business explanation (2-3 paragraphs max). Keep all numbers exactly as provided. Do NOT change or recalculate any numbers.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text && text.trim().length > 10) {
          responseData.summaryText = text.trim();
          responseData.llmPowered = true;
        }
      } catch (err: any) {
        responseData.llmPowered = false;
        responseData.errorFallbackMessage = `Gemini API offline (${err.message}). Displaying verified deterministic analytics.`;
      }
    } else {
      responseData.llmPowered = false;
      responseData.errorFallbackMessage = 'Operating in Deterministic Analytics Mode (Gemini API Key unconfigured). All quantitative metrics are 100% verified.';
    }

    return responseData;
  }

  // Formatters
  private formatPipelineResponse(query: string, deals: any, status: any, dq: any): AgentResponse {
    const formattedPipeline = `₹${(deals.totalPipelineValue / 100000).toFixed(2)} Lakhs (${(deals.totalPipelineValue / 10000000).toFixed(2)} Cr)`;
    const formattedAvg = `₹${(deals.averageDealValue / 100000).toFixed(2)} Lakhs`;

    return {
      query,
      intent: 'PIPELINE_OVERVIEW',
      isAmbiguous: false,
      headline: 'Sales Pipeline Overview & Valuation',
      summaryText: `Total active pipeline is evaluated at ${formattedPipeline} across ${deals.dealsWithValuesCount} valid deal records (out of ${deals.totalDeals} total opportunities). Average deal size stands at ${formattedAvg}.`,
      keyInsights: [
        `Total active pipeline value: ${formattedPipeline}`,
        `Top sector contributor: ${deals.dealsBySector[0]?.sector || 'N/A'} (₹${((deals.dealsBySector[0]?.pipelineValue || 0) / 100000).toFixed(2)} Lakhs)`,
        `High-probability pipeline (≥70% probability): ₹${(deals.highProbabilityPipeline / 100000).toFixed(2)} Lakhs`,
        `Deals with unstated/missing valuation: ${deals.totalDeals - deals.dealsWithValuesCount} records`
      ],
      metricsCards: [
        { label: 'Total Pipeline', value: formattedPipeline, status: 'highlight' },
        { label: 'Active Deals', value: `${deals.totalDeals}`, subtext: `${deals.dealsWithValuesCount} valued` },
        { label: 'Avg Deal Size', value: formattedAvg },
        { label: 'High Prob. Pipeline', value: `₹${(deals.highProbabilityPipeline / 100000).toFixed(2)} L` }
      ],
      evidence: {
        boardName: status.dealsBoardName,
        recordsAnalyzed: deals.totalDeals,
        validRecordsCount: deals.dealsWithValuesCount,
        calculatedMetrics: {
          'Total Pipeline Value': deals.totalPipelineValue,
          'Total Deals Count': deals.totalDeals,
          'Average Deal Value': deals.averageDealValue
        },
        lastRefreshedAt: status.lastRefreshedAt
      },
      dataQualityCaveats: dq.caveats,
      suggestedFollowUps: ['Which sectors have the strongest pipeline?', 'Breakdown pipeline by deal stage', 'Which deals need attention?'],
      llmPowered: false
    };
  }

  private formatSectorResponse(query: string, deals: any, wo: any, cross: any, status: any, dq: any): AgentResponse {
    const topSector = deals.dealsBySector[0] || { sector: 'N/A', pipelineValue: 0 };
    const formattedTopVal = `₹${(topSector.pipelineValue / 100000).toFixed(2)} Lakhs`;

    return {
      query,
      intent: 'SECTOR_PERFORMANCE',
      isAmbiguous: false,
      headline: 'Sector Performance & Opportunity Analysis',
      summaryText: `The pipeline is led by ${topSector.sector} with ${formattedTopVal} in prospective value across ${topSector.dealCount} deals.`,
      keyInsights: deals.dealsBySector.slice(0, 4).map((s: any) => 
        `${s.sector}: ₹${(s.pipelineValue / 100000).toFixed(2)} Lakhs pipeline across ${s.dealCount} deal(s)`
      ),
      metricsCards: deals.dealsBySector.slice(0, 4).map((s: any) => ({
        label: s.sector,
        value: `₹${(s.pipelineValue / 100000).toFixed(2)} L`,
        subtext: `${s.dealCount} deals`
      })),
      evidence: {
        boardName: status.dealsBoardName,
        recordsAnalyzed: deals.totalDeals,
        validRecordsCount: deals.dealsWithValuesCount,
        calculatedMetrics: { 'Top Sector': topSector.sector, 'Top Sector Pipeline': topSector.pipelineValue },
        lastRefreshedAt: status.lastRefreshedAt
      },
      dataQualityCaveats: dq.caveats,
      suggestedFollowUps: ['Compare pipeline with operational workload', 'How are our work orders performing?'],
      llmPowered: false
    };
  }

  private formatWorkOrdersResponse(query: string, wo: any, status: any, dq: any): AgentResponse {
    const formattedBilled = `₹${(wo.totalBilledValueExclGst / 100000).toFixed(2)} Lakhs`;
    const formattedCollected = `₹${(wo.totalCollectedAmountInclGst / 100000).toFixed(2)} Lakhs`;

    return {
      query,
      intent: 'WORK_ORDERS_OVERVIEW',
      isAmbiguous: false,
      headline: 'Work Orders & Operational Execution Summary',
      summaryText: `Analyzed ${wo.totalWorkOrders} work order records. Total billed value to date reaches ${formattedBilled}, with ${formattedCollected} collected.`,
      keyInsights: [
        `Total Work Orders: ${wo.totalWorkOrders}`,
        `Billed Value (Excl GST): ${formattedBilled}`,
        `Collected Value (Incl GST): ${formattedCollected}`,
        `AR Priority Accounts: ${wo.arPriorityCount} accounts with ₹${(wo.arPriorityTotalReceivable / 100000).toFixed(2)} Lakhs receivable`
      ],
      metricsCards: [
        { label: 'Work Orders', value: `${wo.totalWorkOrders}` },
        { label: 'Billed Value', value: formattedBilled, status: 'highlight' },
        { label: 'Collected Amount', value: formattedCollected },
        { label: 'AR Priority Accounts', value: `${wo.arPriorityCount}`, status: wo.arPriorityCount > 0 ? 'warning' : 'normal' }
      ],
      evidence: {
        boardName: status.workOrdersBoardName,
        recordsAnalyzed: wo.totalWorkOrders,
        validRecordsCount: wo.totalWorkOrders - dq.workOrdersMissingAmountCount,
        calculatedMetrics: {
          'Total Work Orders': wo.totalWorkOrders,
          'Total Billed Excl GST': wo.totalBilledValueExclGst,
          'AR Priority Count': wo.arPriorityCount
        },
        lastRefreshedAt: status.lastRefreshedAt
      },
      dataQualityCaveats: dq.caveats,
      suggestedFollowUps: ['Compare pipeline with operational workload', 'What is our current pipeline value?'],
      llmPowered: false
    };
  }

  private formatCrossBoardResponse(query: string, cross: any, status: any, dq: any): AgentResponse {
    return {
      query,
      intent: 'CROSS_BOARD_ANALYSIS',
      isAmbiguous: false,
      headline: 'Cross-Board Sales Pipeline vs. Operational Workload',
      summaryText: `Compared sales opportunities with operational fulfillment across ${cross.matchedSectorsCount} sectors using the common Sector dimension.`,
      keyInsights: cross.crossBoardComparison.map((c: any) => 
        `${c.sector}: ₹${(c.pipelineValue / 100000).toFixed(2)} L pipeline (${c.dealsCount} deals) vs ₹${(c.opsBilledValue / 100000).toFixed(2)} L ops billed (${c.workOrdersCount} work orders)`
      ),
      metricsCards: cross.crossBoardComparison.slice(0, 4).map((c: any) => ({
        label: `${c.sector} Pipeline/Ops`,
        value: `₹${(c.pipelineValue / 100000).toFixed(1)}L / ₹${(c.opsBilledValue / 100000).toFixed(1)}L`,
        subtext: `${c.dealsCount} deals / ${c.workOrdersCount} WOs`
      })),
      evidence: {
        boardName: `${status.dealsBoardName} & ${status.workOrdersBoardName}`,
        recordsAnalyzed: cross.crossBoardComparison.length,
        validRecordsCount: cross.crossBoardComparison.length,
        calculatedMetrics: { 'Matched Sectors': cross.matchedSectorsCount },
        lastRefreshedAt: status.lastRefreshedAt
      },
      dataQualityCaveats: [cross.dataAvailabilityNote, ...dq.caveats],
      suggestedFollowUps: ['Prepare a leadership update', 'What is our current pipeline value?'],
      llmPowered: false
    };
  }

  private formatLeadershipBriefResponse(query: string, deals: any, wo: any, cross: any, status: any, dq: any): AgentResponse {
    const formattedPipeline = `₹${(deals.totalPipelineValue / 100000).toFixed(2)} Lakhs`;
    const formattedBilled = `₹${(wo.totalBilledValueExclGst / 100000).toFixed(2)} Lakhs`;

    return {
      query,
      intent: 'LEADERSHIP_BRIEF',
      isAmbiguous: false,
      headline: 'Skylark Intelligence - Executive Leadership Brief',
      summaryText: `EXECUTIVE SNAPSHOT:\nTotal sales pipeline stands at ${formattedPipeline} across ${deals.totalDeals} opportunities. Operational fulfillment has generated ${formattedBilled} in billed value across ${wo.totalWorkOrders} active work orders.`,
      keyInsights: [
        `Sales Pipeline: ${formattedPipeline} total (${deals.highProbabilityPipeline > 0 ? `₹${(deals.highProbabilityPipeline / 100000).toFixed(2)} L high-probability` : 'High probability status pending'})`,
        `Operational Billed Value: ${formattedBilled} across ${wo.totalWorkOrders} execution projects`,
        `Primary Revenue Sector: ${deals.dealsBySector[0]?.sector || 'Mining'} leads with ₹${((deals.dealsBySector[0]?.pipelineValue || 0) / 100000).toFixed(2)} L pipeline`,
        `Key Risk / Caveat: ${dq.dealsMissingValueCount} deals missing valuation, ${dq.dealsMissingCloseDateCount} deals missing close dates`
      ],
      metricsCards: [
        { label: 'Total Pipeline', value: formattedPipeline, status: 'highlight' },
        { label: 'Ops Billed Value', value: formattedBilled },
        { label: 'Active Deals', value: `${deals.totalDeals}` },
        { label: 'Work Orders', value: `${wo.totalWorkOrders}` }
      ],
      evidence: {
        boardName: `${status.dealsBoardName} & ${status.workOrdersBoardName}`,
        recordsAnalyzed: deals.totalDeals + wo.totalWorkOrders,
        validRecordsCount: deals.dealsWithValuesCount + wo.totalWorkOrders,
        calculatedMetrics: {
          'Total Pipeline': deals.totalPipelineValue,
          'Ops Billed': wo.totalBilledValueExclGst
        },
        lastRefreshedAt: status.lastRefreshedAt
      },
      dataQualityCaveats: dq.caveats,
      suggestedFollowUps: ['Which deals need attention?', 'Compare pipeline with operational workload'],
      llmPowered: false
    };
  }

  private formatDataQualityResponse(query: string, dq: any, status: any): AgentResponse {
    return {
      query,
      intent: 'DATA_QUALITY',
      isAmbiguous: false,
      headline: 'Board Data Quality & Normalization Audit',
      summaryText: `Audit indicates ${dq.dealsCompletenessPercentage}% field completeness for Deals Board and ${dq.workOrdersCompletenessPercentage}% completeness for Work Orders Board.`,
      keyInsights: [
        `Deals Board Completeness: ${dq.dealsCompletenessPercentage}% (${dq.dealsMissingValueCount} records missing values)`,
        `Work Orders Completeness: ${dq.workOrdersCompletenessPercentage}% (${dq.workOrdersMissingAmountCount} missing contract amounts)`,
        `Missing Close Dates: ${dq.dealsMissingCloseDateCount} deal records`,
        ...dq.appliedRules.slice(0, 2)
      ],
      metricsCards: [
        { label: 'Deals Completeness', value: `${dq.dealsCompletenessPercentage}%`, status: dq.dealsCompletenessPercentage > 80 ? 'highlight' : 'warning' },
        { label: 'Work Orders Completeness', value: `${dq.workOrdersCompletenessPercentage}%`, status: dq.workOrdersCompletenessPercentage > 80 ? 'highlight' : 'warning' },
        { label: 'Missing Deal Values', value: `${dq.dealsMissingValueCount}` },
        { label: 'Missing Close Dates', value: `${dq.dealsMissingCloseDateCount}` }
      ],
      evidence: {
        boardName: `${status.dealsBoardName} & ${status.workOrdersBoardName}`,
        recordsAnalyzed: dq.dealsTotal + dq.workOrdersTotal,
        validRecordsCount: dq.dealsTotal + dq.workOrdersTotal,
        calculatedMetrics: {
          'Deals Completeness %': dq.dealsCompletenessPercentage,
          'Work Orders Completeness %': dq.workOrdersCompletenessPercentage
        },
        lastRefreshedAt: status.lastRefreshedAt
      },
      dataQualityCaveats: dq.caveats,
      suggestedFollowUps: ['What is our current pipeline value?', 'How are our work orders performing?'],
      llmPowered: false
    };
  }
}

export const agentService = new AgentService();
