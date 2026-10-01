import {
  getChartData,
  getDashboardAnalytics,
  getDashboardSummary,
  getSchemeBreakdown,
  getSchemeById,
  listFinancialYears,
  listSchemes,
} from '../services/financialService.js';
import { importExcelWorkbook } from '../services/excelImportService.js';

export async function getSummary(req, res) {
  try {
    const financialYearId = req.query.financialYearId
      ? Number(req.query.financialYearId)
      : undefined;
    const data = await getDashboardSummary(financialYearId);
    const years = await listFinancialYears();
    return res.json({ ...data, financialYears: years });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load summary' });
  }
}

export async function getSchemesDashboard(req, res) {
  try {
    const financialYearId = req.query.financialYearId
      ? Number(req.query.financialYearId)
      : undefined;
    const search = req.query.search || '';
    const data = await getSchemeBreakdown(financialYearId, search);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load schemes' });
  }
}

export async function getAnalytics(req, res) {
  try {
    const financialYearId = req.query.financialYearId
      ? Number(req.query.financialYearId)
      : undefined;
    const data = await getDashboardAnalytics(financialYearId);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load analytics' });
  }
}

export async function getCharts(req, res) {
  try {
    const financialYearId = req.query.financialYearId
      ? Number(req.query.financialYearId)
      : undefined;
    const data = await getChartData(financialYearId);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load charts' });
  }
}

export async function getSchemes(req, res) {
  try {
    const financialYearId = req.query.financialYearId
      ? Number(req.query.financialYearId)
      : undefined;
    const search = req.query.search || '';
    const data = await listSchemes(financialYearId, search);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load schemes' });
  }
}

export async function getScheme(req, res) {
  try {
    const schemeId = Number(req.params.id);
    const financialYearId = req.query.financialYearId
      ? Number(req.query.financialYearId)
      : undefined;
    const data = await getSchemeById(schemeId, financialYearId);
    if (!data) return res.status(404).json({ message: 'Scheme not found' });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load scheme' });
  }
}

export async function importFinancialExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel file is required' });
    }

    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Upload .xlsx only.' });
    }

    const importVouchers = req.body.importVouchers === 'true';
    const result = await importExcelWorkbook({
      filePath: req.file.path,
      fileName: req.file.originalname,
      importedBy: req.user.id,
      importVouchers,
    });

    return res.json({
      message: 'Import completed',
      ...result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Import failed' });
  }
}
