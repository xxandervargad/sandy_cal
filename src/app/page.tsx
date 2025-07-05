"use client";

import { useState } from "react";

export default function Home() {
  const [testResponse, setTestResponse] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [healthResponse, setHealthResponse] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [postData, setPostData] = useState('{"name": "John", "age": 30}');
  const [loading, setLoading] = useState(false);

  const testGetEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test");
      const data = await response.json();
      setTestResponse(data);
    } catch {
      setTestResponse({ error: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  const testPostEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: postData,
      });
      const data = await response.json();
      setTestResponse(data);
    } catch {
      setTestResponse({ error: "Failed to post data" });
    } finally {
      setLoading(false);
    }
  };

  const testHealthEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealthResponse(data);
    } catch {
      setHealthResponse({ error: "Failed to fetch health data" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          API Test Frontend
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Test API Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Test API Endpoint
            </h2>

            <div className="space-y-4">
              <button
                onClick={testGetEndpoint}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded transition-colors">
                {loading ? "Loading..." : "Test GET /api/test"}
              </button>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  POST Data (JSON):
                </label>
                <textarea
                  value={postData}
                  onChange={(e) => setPostData(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={'{"name": "John", "age": 30}'}
                />
              </div>

              <button
                onClick={testPostEndpoint}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded transition-colors">
                {loading ? "Loading..." : "Test POST /api/test"}
              </button>
            </div>

            {testResponse && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Response:
                </h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40 border border-gray-300 font-mono whitespace-pre-wrap text-gray-700">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Health API Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Health Check API
            </h2>

            <button
              onClick={testHealthEndpoint}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-medium py-2 px-4 rounded transition-colors">
              {loading ? "Loading..." : "Test GET /api/health"}
            </button>

            {healthResponse && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Response:
                </h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40 border border-gray-300 font-mono whitespace-pre-wrap">
                  {JSON.stringify(healthResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">
            How to Use:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Click &quot;Test GET /api/test&quot; to test the GET endpoint
            </li>
            <li>
              • Modify the JSON data and click &quot;Test POST /api/test&quot;
              to test the POST endpoint
            </li>
            <li>
              • Click &quot;Test GET /api/health&quot; to check system health
            </li>
            <li>• Responses will appear below each section</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
