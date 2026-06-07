export function useDashboardHelpers() {
  
  // Formats a Date object to "MMM D, YYYY" (e.g., "Jun 6, 2026")
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Maps organization and facility types to TailwindCSS utility color classes
  const getTypeClass = (type) => {
    if (!type) return '';
    const typeMap = {
      // Organization Types
      'Private': 'bg-amber-100 text-amber-800',
      'NGO': 'bg-emerald-100 text-emerald-800',
      'International': 'bg-purple-100 text-purple-800',
      'UN Agency': 'bg-cyan-100 text-cyan-800',
      'Government': 'bg-blue-100 text-blue-800',
      
      // Facility Types
      'Medical Point': 'bg-amber-100 text-amber-800',
      'Pharmacy': 'bg-emerald-100 text-emerald-800',
      'Clinic': 'bg-blue-100 text-blue-800',
      'Hospital': 'bg-red-100 text-red-800'
    };
    return typeMap[type] || 'bg-amber-100 text-amber-800';
  };

  // Generates Google Maps URL from coordinates string
  const getMapLink = (coords) => {
    if (!coords) return '#';
    const cleanCoords = coords.trim().replace(/\s+/g, '');
    return `https://www.google.com/maps/search/?api=1&query=${cleanCoords}`;
  };

  return {
    formatDate,
    getTypeClass,
    getMapLink
  };
}
