import './style.css';

const searchForm = document.querySelector<HTMLFormElement>('#search-form');
const searchInput = document.querySelector<HTMLInputElement>('#search-input');
const historyContainer = document.querySelector<HTMLDivElement>('#history');
const weatherTitle = document.querySelector<HTMLHeadingElement>('#search-title');
const tempEl = document.querySelector<HTMLParagraphElement>('#temp');
const windEl = document.querySelector<HTMLParagraphElement>('#wind');
const humidityEl = document.querySelector<HTMLParagraphElement>('#humidity');
const forecastContainer = document.querySelector<HTMLDivElement>('#forecast');

async function fetchWeather(city: string) {
  const res = await fetch('/api/weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  });

  if (!res.ok) {
    alert('Failed to fetch weather');
    return;
  }

  const data = await res.json();
  renderWeather(data);
  loadHistory();
}

function renderWeather(data: any) {
  if (!data || !data.city || !data.list) return;

  weatherTitle!.textContent = `${data.city.name} (${new Date().toLocaleDateString()})`;

  const today = data.list[0];
  tempEl!.textContent = `Temperature: ${today.main.temp} °F`;
  windEl!.textContent = `Wind: ${today.wind.speed} MPH`;
  humidityEl!.textContent = `Humidity: ${today.main.humidity}%`;

  forecastContainer!.innerHTML = '';
  for (let i = 1; i < data.list.length; i += 8) {
    const forecast = data.list[i];
    const card = document.createElement('div');
    card.classList.add('card', 'col-md-2', 'm-2', 'bg-primary', 'text-white', 'p-2');

    card.innerHTML = `
      <h5>${new Date(forecast.dt_txt).toLocaleDateString()}</h5>
      <p>Temp: ${forecast.main.temp} °F</p>
      <p>Wind: ${forecast.wind.speed} MPH</p>
      <p>Humidity: ${forecast.main.humidity}%</p>
    `;

    forecastContainer!.appendChild(card);
  }
}

async function loadHistory() {
  const res = await fetch('/api/weather/history');
  const history = await res.json();

  historyContainer!.innerHTML = '';
  history.forEach((entry: { id: string; city: string }) => {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary my-1';
    button.textContent = entry.city;
    button.onclick = () => fetchWeather(entry.city);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm ms-2';
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = async () => {
      await fetch(`/api/weather/history/${entry.id}`, { method: 'DELETE' });
      loadHistory();
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex justify-content-between align-items-center';
    wrapper.appendChild(button);
    wrapper.appendChild(deleteBtn);

    historyContainer!.appendChild(wrapper);
  });
}

searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = searchInput?.value.trim();
  if (city) {
    fetchWeather(city);
    searchInput.value = '';
  }
});

loadHistory();


