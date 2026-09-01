"""
Festa Festum — Vendor Matching Score
Data Scientist | Minggu 2

Formula:
    vendor_score = rating_score * 0.40
                 + budget_score * 0.35
                 + availability_score * 0.25

Output: vendor_score (0-100), dipakai Fullstack untuk sorting GET /api/v1/vendors
"""

import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler


def load_vendors(csv_path: str = "datasets/vendors.csv") -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df["price_mid"] = (df["price_start"] + df["price_end"]) / 2
    return df


def _rating_score(df: pd.DataFrame) -> pd.Series:
    """Normalisasi rating ke skala 0-100."""
    scaler = MinMaxScaler()
    return pd.Series(
        scaler.fit_transform(df[["rating"]]).flatten() * 100,
        index=df.index
    )


def _budget_score(df: pd.DataFrame, user_budget: int | None) -> pd.Series:
    """
    Skor kesesuaian harga dengan budget user.

    - Budget masuk dalam range harga vendor : 100
    - Budget lebih besar dari harga maksimal : 80  (vendor terjangkau)
    - Budget kurang dari harga minimal       : turun proporsional (min 0)
    - Tanpa budget user                      : inverse price (lebih murah = skor lebih tinggi)
    """
    if user_budget is None:
        scaler = MinMaxScaler()
        scores = scaler.fit_transform(-df[["price_mid"]].values).flatten() * 100
        return pd.Series(scores, index=df.index)

    def _fit(row):
        if row["price_start"] <= user_budget <= row["price_end"]:
            return 100.0
        if user_budget > row["price_end"]:
            return 80.0
        diff_ratio = (row["price_start"] - user_budget) / row["price_start"]
        return max(0.0, 100.0 - diff_ratio * 100)

    return df.apply(_fit, axis=1)


def _availability_score(df: pd.DataFrame) -> pd.Series:
    """
    Placeholder: semua vendor tersedia (skor 100).
    Pada produksi: ganti dengan query tabel Vendor_Schedules di database.
    Logika produksi:
        - Tanggal kosong  -> 100
        - Sudah di-booking -> 0
    """
    return pd.Series(100.0, index=df.index)


def compute_vendor_scores(
    df: pd.DataFrame,
    user_budget: int | None = None,
    category: str | None = None,
    city: str | None = None,
    top_n: int | None = None,
) -> pd.DataFrame:
    """
    Hitung Vendor Matching Score.

    Parameters
    ----------
    df          : DataFrame hasil load_vendors()
    user_budget : Budget user dalam Rupiah (opsional)
    category    : Filter kategori, misal 'Fotografer' (opsional)
    city        : Filter kota, misal 'Jakarta' (opsional)
    top_n       : Ambil N vendor teratas saja (opsional)

    Returns
    -------
    DataFrame sorted by vendor_score descending, dengan kolom tambahan:
        rating_score, budget_score, availability_score, vendor_score
    """
    result = df.copy()

    if category:
        result = result[result["category"] == category].copy()
    if city:
        result = result[result["city"] == city].copy()

    if result.empty:
        return result

    result["rating_score"]       = _rating_score(result)
    result["budget_score"]       = _budget_score(result, user_budget)
    result["availability_score"] = _availability_score(result)

    result["vendor_score"] = (
        result["rating_score"]       * 0.40 +
        result["budget_score"]       * 0.35 +
        result["availability_score"] * 0.25
    ).round(2)

    result = result.sort_values("vendor_score", ascending=False).reset_index(drop=True)

    if top_n:
        result = result.head(top_n)

    return result


def to_api_json(df_scored: pd.DataFrame) -> list[dict]:
    """
    Konversi hasil scoring ke format JSON untuk endpoint GET /api/v1/vendors.

    Contoh respons:
    [
      {
        "vendor_id": "FT-007",
        "vendor_name": "Golden Hour Photo",
        "category": "Fotografer",
        "city": "Jakarta",
        "price_start": 2500000,
        "price_end": 7000000,
        "style_tags": "Golden Hour, Warm, Cinematic",
        "rating": 4.9,
        "vendor_score": 87.5
      },
      ...
    ]
    """
    cols = [
        "vendor_id", "vendor_name", "category", "city",
        "price_start", "price_end", "style_tags", "rating", "vendor_score"
    ]
    return df_scored[cols].to_dict(orient="records")


if __name__ == "__main__":
    df = load_vendors()

    print("=== Simulasi: Fotografer, budget Rp 2.000.000 ===")
    result = compute_vendor_scores(df, user_budget=2_000_000, category="Fotografer", top_n=10)
    cols_show = ["vendor_id", "vendor_name", "city", "price_start", "price_end",
                 "rating", "rating_score", "budget_score", "vendor_score"]
    print(result[cols_show].to_string(index=False))

    print("\n=== Output JSON (top 5) ===")
    print(json.dumps(to_api_json(result.head(5)), indent=2, ensure_ascii=False))

    print("\n=== Rata-rata Score per Kategori ===")
    for cat in df["category"].unique():
        scored = compute_vendor_scores(df, category=cat)
        print(f"{cat:<25} | Avg: {scored['vendor_score'].mean():.1f} | Top: {scored.iloc[0]['vendor_name']}")
