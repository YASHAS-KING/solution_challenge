import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../config/firebase";

export function useIncidents(limitCount = 50) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.() || new Date(),
      }));
      setIncidents(data);
      setLoading(false);
    });
    return () => unsub();
  }, [limitCount]);

  return { incidents, loading };
}

export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "devices"), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDevices(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { devices, loading };
}
