// 'use client';

// import { useEffect, useState } from 'react';

// export default function DataDisplay() {
//   const [data, setData] = useState([]); // always an array
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('/api/data')
//       .then(res => res.json())
//       .then((json) => {
//         if (Array.isArray(json)) {
//           setData(json);
//         } else {
//           setData([]);
//           if (json.error) setError(json.error);
//         }
//       })
//       .catch(err => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div>
//       <h2>Database Data</h2>
//       {data.length === 0 ? (
//         <p>No data found</p>
//       ) : (
//         <table border="1" cellPadding="5">
//           <thead>
//             <tr>
//               {/* Replace with your table columns */}
//               <th>ID</th>
//               <th>Name</th>
//               <th>Email</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map(row => (
//               <tr key={row.id}>
//                 <td>{row.id}</td>
//                 <td>{row.name}</td>
//                 <td>{row.email}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';

export default function DataDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(async (res) => {
        try {
          return await res.json(); // try parse JSON
        } catch (e) {
          throw new Error('Invalid JSON response from API');
        }
      })
      .then((json) => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([]);
          if (json.error) setError(json.error + ' - ' + (json.detail || ''));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  if (data.length === 0) return <p>No data found</p>;

  const columns = Object.keys(data[0]);

  return (
    <div>
      <h2>Database Data</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map(col => <td key={col}>{row[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
