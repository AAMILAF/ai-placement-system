{score !== null && (
  <div className="mt-3">
    <p className="font-medium">ATS Score</p>
    <div className="w-full bg-gray-200 rounded h-3">
      <div
        className="bg-green-500 h-3 rounded"
        style={{ width: `${score}%` }}
      />
    </div>
    <p className="text-sm mt-1">{score} / 100</p>
  </div>
)}
