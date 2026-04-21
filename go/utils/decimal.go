package utils

import "github.com/shopspring/decimal"

// RoundToTwo округляет decimal до двух знаков
func RoundToTwo(d decimal.Decimal) decimal.Decimal {
	return d.Round(2)
}

// ParseDecimal безопасно парсит строку в decimal
func ParseDecimal(s string) (decimal.Decimal, error) {
	return decimal.NewFromString(s)
}

// MustParseDecimal парсит строку или паникует
func MustParseDecimal(s string) decimal.Decimal {
	d, err := decimal.NewFromString(s)
	if err != nil {
		panic(err)
	}
	return d
}
