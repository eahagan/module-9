function renderSearchHistory(cities: { id: string; city: string }[]) {
  const historyContainer = document.getElementById('history');
  if (!historyContainer) return;

  historyContainer.innerHTML = ''; // clear current list

  cities.forEach((entry) => {
    const cityDiv = document.createElement('div');
    cityDiv.className = 'list-group-item city-entry d-flex justify-content-between align-items-center';
    cityDiv.innerHTML = `
      <span>${entry.city}</span>
      <button class="delete-btn btn btn-danger btn-sm" data-id="${entry.id}">Delete</button>
    `;

    // Add delete event listener
    const deleteBtn = cityDiv.querySelector('button.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        try {
          const res = await fetch(`/api/weather/history/${entry.id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            // After deletion, re-fetch and re-render history
            const updatedRes = await fetch('/api/weather/history');
            const updatedCities = await updatedRes.json();
            renderSearchHistory(updatedCities);
          } else {
            console.error('Failed to delete city');
          }
        } catch (err) {
          console.error('Error deleting city:', err);
        }
      });
    }

    historyContainer.appendChild(cityDiv);
  });
}

