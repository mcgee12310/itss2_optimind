"use client";

import { useEffect, useState } from "react";

export default function TestChatAPI() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages/rooms");
      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Chat API</h1>

      <div className="space-y-4">
        <button
          onClick={testGetRooms}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Test GET /api/messages/rooms"}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Response (Status: {result.status}):</h3>
            <pre className="overflow-auto max-h-96">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold mb-2">Hướng dẫn:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Đăng nhập trước để có cookie user_data</li>
          <li>Click vào button "Test GET /api/messages/rooms"</li>
          <li>Kiểm tra response để xem có rooms nào không</li>
          <li>Nếu có lỗi 401, bạn cần đăng nhập</li>
        </ol>
      </div>
    </div>
  );
}
