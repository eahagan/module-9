function renderSearchHistory(cities: { id: string; name: string }[]) {
  const historyContainer = document.getElementById('history');
  if (!historyContainer) return;

  historyContainer.innerHTML = ''; // clear current list

  cities.forEach((city) => {
    const cityDiv = document.createElement('div');
    cityDiv.className = 'list-group-item city-entry d-flex justify-content-between align-items-center';
    cityDiv.innerHTML = `
      <span>${city.name}</span>
      <button class="delete-btn btn btn-danger btn-sm" data-id="${city.id}">Delete</button>
    `;
    historyContainer.appendChild(cityDiv);
  });
}
