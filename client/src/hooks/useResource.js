import { useCallback, useEffect, useRef, useState } from "react";
export function useResource(loader, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  const loadRef = useRef(loader);
  loadRef.current = loader;
  const key = JSON.stringify(deps);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loadRef
      .current()
      .then((data) => {
        if (live) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (live) setState({ data: null, loading: false, error });
      });
    return () => {
      live = false;
    };
  }, [key, revision]);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  return { ...state, reload };
}
export function useDebounce(value, delay = 300) {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setResult(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return result;
}
