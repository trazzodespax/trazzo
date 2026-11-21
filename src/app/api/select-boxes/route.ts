// src/app/api/select-boxes/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { boxes, targetWeight } = await request.json();

  // Algoritmo de programación dinámica o backtracking (mejorado)
  let bestSum = 0;
  let minDiff = Infinity;
  let bestIndices: number[] = [];

  function search(idx: number, currentSum: number, currentCombo: number[]) {
    const diff = Math.abs(targetWeight - currentSum);
    
    // Si encontramos una suma más cercana al objetivo
    if (diff < minDiff) {
      minDiff = diff;
      bestSum = currentSum;
      bestIndices = [...currentCombo];
    }
    
    // Si la diferencia es menor a 0.01 lbs, es una coincidencia perfecta
    if (minDiff < 0.01) return;

    for (let i = idx; i < boxes.length; i++) {
      if (boxes[i].weight <= 0) continue;
      currentCombo.push(i);
      search(i + 1, currentSum + boxes[i].weight, currentCombo);
      currentCombo.pop();
      if (minDiff < 0.01) return;
    }
  }

  search(0, 0, []);

  return NextResponse.json({
    optimalWeight: Number(bestSum.toFixed(2)),
    selectedBoxIds: bestIndices.map(i => boxes[i].id),
    excludedWeight: Number((boxes.reduce((a: number, b: any) => a + b.weight, 0) - bestSum).toFixed(2))
  });
}