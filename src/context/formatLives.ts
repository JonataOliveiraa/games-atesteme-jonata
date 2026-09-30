/** O saldo do protótipo é infinito, e `Infinity` na tela é feio. */
export function formatLives(lives: number): string {
  return Number.isFinite(lives) ? String(lives) : "∞";
}
