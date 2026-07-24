const PREFIX = 'atesteme:tutorial:'

export function wasTutorialSeen(key: string): boolean {
  try {
    return localStorage.getItem(PREFIX + key) === '1'
  } catch {
    return false
  }
}

export function markTutorialSeen(key: string) {
  try {
    localStorage.setItem(PREFIX + key, '1')
  } catch {
    // modo privado / storage bloqueado
  }
}

export function resetTutorials() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k))
  } catch {
    // ignorado
  }
}