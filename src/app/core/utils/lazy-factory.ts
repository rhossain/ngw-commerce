// Helper for succinct standalone component lazy loading in route definitions.
// Example: loadComponent: lazy(() => import('./path').then(m => m.Component))
export function lazy<T>(loader: () => Promise<T>): () => Promise<T> {
  return () => loader();
}
