jest.mock('../src/models/Transaction', () => ({
  find: jest.fn(),
}));

jest.mock('../src/services/aiRecommendationService', () => ({
  generateFinancialRecommendations: jest.fn(),
}));

const Transaction = require('../src/models/Transaction');
const {
  generateFinancialRecommendations,
} = require('../src/services/aiRecommendationService');

const {
  generateRecommendations,
} = require('../src/controllers/aiRecommendationController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('aiRecommendationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns empty recommendations when user has no transactions', async () => {
    Transaction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });

    const req = {
      user: {
        id: 'user-123',
      },
    };

    const res = createResponse();

    await generateRecommendations(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        recommendations: [],
        source: 'gemini',
      })
    );

    expect(
      generateFinancialRecommendations
    ).not.toHaveBeenCalled();
  });

  test('generates recommendations from user transactions', async () => {
    const transactions = [
      {
        date: new Date('2026-09-01'),
        merchant: 'Amruth Tea',
        amount: 50,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'amruth_tea',
      },
      {
        date: new Date('2026-09-02'),
        merchant: 'Amruth Tea',
        amount: 60,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'amruth_tea',
      },
    ];

    Transaction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(transactions),
      }),
    });

    generateFinancialRecommendations.mockResolvedValue([
      {
        type: 'SPENDING_INCREASE',
        title: 'Review repeated tea spending',
        message: 'Tea purchases appear repeatedly in the available data.',
        evidence: 'Amruth Tea appears multiple times.',
        action: 'Review this spending pattern over time.',
      },
    ]);

    const req = {
      user: {
        id: 'user-123',
      },
    };

    const res = createResponse();

    await generateRecommendations(req, res);

    expect(Transaction.find).toHaveBeenCalledWith({
      user: 'user-123',
    });

    expect(
      generateFinancialRecommendations
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: expect.any(Object),
        patterns: expect.any(Object),
        comparisons: expect.any(Array),
        insights: expect.any(Array),
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        source: 'gemini',
        recommendations: expect.any(Array),
      })
    );
  });

  test('uses previous and current calendar months for spending comparisons', async () => {
    const transactions = [
      {
        date: new Date('2026-09-05'),
        merchant: 'Amruth Tea',
        amount: 40,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'amruth_tea',
      },
      {
        date: new Date('2026-09-15'),
        merchant: 'Amruth Tea',
        amount: 50,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'amruth_tea',
      },
      {
        date: new Date('2026-10-05'),
        merchant: 'Amruth Tea',
        amount: 100,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'amruth_tea',
      },
    ];

    Transaction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(transactions),
      }),
    });

    generateFinancialRecommendations.mockResolvedValue([]);

    const req = {
      user: {
        id: 'user-123',
      },
    };

    const res = createResponse();

    await generateRecommendations(req, res);

    expect(
      generateFinancialRecommendations
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        comparisons: expect.arrayContaining([
          expect.objectContaining({
            entityKey: 'amruth_tea',
            previousAmount: 90,
            currentAmount: 100,
            changeAmount: 10,
          }),
        ]),
      })
    );
  });

  test('returns 503 when Gemini is not configured', async () => {
    Transaction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            date: new Date('2026-09-01'),
            merchant: 'Test Merchant',
            amount: 100,
            type: 'DEBIT',
            category: 'food',
          },
        ]),
      }),
    });

    generateFinancialRecommendations.mockRejectedValue(
      new Error('GEMINI_API_KEY is not configured')
    );

    const req = {
      user: {
        id: 'user-123',
      },
    };

    const res = createResponse();

    await generateRecommendations(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'AI recommendation service is not configured.',
    });
  });

  test('returns 503 when Gemini is temporarily unavailable', async () => {
    Transaction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            date: new Date('2026-09-01'),
            merchant: 'Test Merchant',
            amount: 100,
            type: 'DEBIT',
            category: 'food',
          },
        ]),
      }),
    });

    generateFinancialRecommendations.mockRejectedValue(
      new Error('503 UNAVAILABLE')
    );

    const req = {
      user: {
        id: 'user-123',
      },
    };

    const res = createResponse();

    await generateRecommendations(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });
});