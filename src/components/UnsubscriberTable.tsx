import { Calendar, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Unsubscriber = {
  form_data: {
    Email: string;
    "Reason for Unsubscribing": string;
  };
  form_date: string;
};

type SortableKey = "Email" | "Reason for Unsubscribing" | "form_date";

type SortConfig = {
  key: SortableKey;
  direction: "ascending" | "descending";
};

export default function UnsubscriberTable() {
  const [data, setData] = useState<Unsubscriber[]>([]);
  const [filteredData, setFilteredData] = useState<Unsubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "form_date",
    direction: "descending",
  });
  const itemsPerPage = 10;

  const handleRefresh = () => {
    setLoading(true);
    fetch("https://publishers.clarovate.io/wp-json/wpforms/v1/form/4819")
      .then((res) => res.json())
      .then((json) => {
        setData(json); // Only update the source data
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch unsubscribers:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("https://publishers.clarovate.io/wp-json/wpforms/v1/form/4819")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setFilteredData(json); // Keep this only in initial load
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch unsubscribers:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = data.filter((entry) => {
      const entryDate = new Date(entry.form_date);
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      return (!start || entryDate >= start) && (!end || entryDate <= end);
    });
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [startDate, endDate, data]);

  const sortedData = [...filteredData].sort(
    (a: Unsubscriber, b: Unsubscriber) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortConfig.key) {
        case "Email":
          aValue = a.form_data.Email.toLowerCase();
          bValue = b.form_data.Email.toLowerCase();
          break;
        case "Reason for Unsubscribing":
          aValue = a.form_data["Reason for Unsubscribing"].toLowerCase();
          bValue = b.form_data["Reason for Unsubscribing"].toLowerCase();
          break;
        case "form_date":
          aValue = new Date(a.form_date);
          bValue = new Date(b.form_date);
          break;
        default:
          // This should never happen due to SortableKey type
          return 0;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const aTime = aValue.getTime();
        const bTime = bValue.getTime();

        if (aTime < bTime) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aTime > bTime) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      }

      // String comparison
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    }
  );

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const requestSort = (key: SortableKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <svg
          className="w-3 h-3 ml-1.5 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    if (sortConfig.direction === "ascending") {
      return (
        <svg
          className="w-3 h-3 ml-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-3 h-3 ml-1.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const getMostCommonReason = () => {
    const reasons = filteredData.reduce(
      (acc: { [key: string]: number }, entry) => {
        const reason = entry.form_data["Reason for Unsubscribing"];
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      },
      {}
    );

    const max = Math.max(...Object.values(reasons));
    return Object.keys(reasons).find((key) => reasons[key] === max) || "N/A";
  };

  const exportToCSV = () => {
    const csvRows = [
      ["Email", "Reason for Unsubscribing", "Date"],
      ...sortedData.map((d) => [
        // Changed from filteredData to sortedData
        d.form_data.Email,
        d.form_data["Reason for Unsubscribing"],
        new Date(d.form_date).toLocaleString(),
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.map((i) => `"${i}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "unsubscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-4">
          {/* Animated logo/icon */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 animate-pulse"></div>
            <div className="absolute inset-2 flex items-center justify-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                  opacity=".25"
                />
                <path
                  fill="currentColor"
                  d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                />
              </svg>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full animate-[progress_2s_ease-in-out_infinite]"
              style={{ width: "65%" }}
            ></div>
          </div>

          {/* Optional status text */}
          <p className="mt-4 text-xs text-gray-400 font-mono">
            Loading: {Math.floor(Math.random() * 85) + 15}% •
          </p>
        </div>
      </div>
    );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm px-6 py-6 rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            {/* Title Section */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white/90 rounded-xl shadow-xs border border-gray-200/50 flex-shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-sm">
                  <svg
                    className="h-7 w-7 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                      Unsubscriber Analytics
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Beta
                    </span>
                  </div>
                  <p className="mt-1.5 text-gray-600 text-sm font-medium flex items-center gap-1.5">
                    <span>
                      Gain visibility into unsubscribe behavior to enhance your
                      communication strategy
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Date Range Picker - Enhanced */}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                  disabled={filteredData.length === 0}
                >
                  <svg
                    className="h-5 w-5 text-white transition-transform group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export
                  <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm">
                    CSV
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {/* Total Unsubscribers */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 w-full h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between gap-4 flex-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    Total Unsubscribers
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
                    {filteredData.length.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-2 sm:p-3 flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                {startDate && endDate ? (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {new Date(startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    All time
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Most Common Reason */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 w-full h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between gap-4 flex-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    Top Reason
                  </p>
                  <p className="mt-1 text-l sm:text-l font-bold text-gray-900 truncate">
                    {getMostCommonReason() || "No data"}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-2 sm:p-3 flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 inline-flex items-center gap-1">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Most frequent reason selected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/90 p-4 rounded-xl border border-gray-200/70 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white/90 pl-3 pr-2 py-2 rounded-lg border border-gray-200/70 shadow-xs hover:border-blue-300 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-500">
              <svg
                className="w-5 h-5 text-blue-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start date"
                className="w-32 text-sm focus:outline-none text-gray-700 font-medium"
                dateFormat="MMM d, yyyy"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/90 pl-3 pr-2 py-2 rounded-lg border border-gray-200/70 shadow-xs hover:border-blue-300 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-500">
              <svg
                className="w-5 h-5 text-blue-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End date"
                className="w-32 text-sm focus:outline-none text-gray-700 font-medium"
                dateFormat="MMM d, yyyy"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="flex items-center gap-1.5 bg-white/90 pl-3 pr-3 py-2 rounded-lg border border-gray-200/70 shadow-xs hover:bg-gray-50 transition-all duration-200 text-gray-600 hover:text-blue-600 text-sm font-medium hover:border-blue-300"
                title="Reset date filter"
              >
                {/* Keep reset button content the same */}Reset
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleRefresh();
            }}
            className="flex items-center gap-2 bg-white/90 pl-3 pr-3 py-2 rounded-lg border border-gray-200/70 shadow-xs hover:bg-gray-50 transition-all duration-200 text-gray-600 hover:text-blue-600 text-sm font-medium hover:border-blue-300"
            title="Refresh data"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 sticky top-0">
              <tr>
                <th
                  className="px-6 py-3.5 font-semibold text-left text-sm text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors"
                  onClick={() => requestSort("Email")}
                >
                  <div className="flex items-center">
                    Email
                    {getSortIcon("Email")}
                  </div>
                </th>
                <th
                  className="px-6 py-3.5 font-semibold text-left text-sm text-gray-700 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-blue-100/50 transition-colors"
                  onClick={() => requestSort("Reason for Unsubscribing")}
                >
                  <div className="flex items-center">
                    Reason
                    {getSortIcon("Reason for Unsubscribing")}
                  </div>
                </th>
                <th
                  className="px-6 py-3.5 font-semibold text-left text-sm text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors"
                  onClick={() => requestSort("form_date")}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon("form_date")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((entry, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/50 transition-colors duration-150 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {entry.form_data.Email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-[300px]">
                      {entry.form_data["Reason for Unsubscribing"]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(entry.form_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* No results and pagination components remain the same... */}
        </div>

        {/* Pagination */}
        {sortedData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, sortedData.length)}
                  </span>{" "}
                  of <span className="font-medium">{sortedData.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
