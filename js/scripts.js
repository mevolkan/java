window.onload = fetchStation;

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function fetchStation() {
  const map = L.map("stationMap").setView([0.1768696, 37.9083264], 10);
  const sidebar = document.getElementById("sidebar");
  const sideContainer = document.getElementById("side");
  const searchInput = document.getElementById("searchInput");
  const suggestionsList = document.getElementById("suggestionsList");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const javaDataUrl = `${siteUrl.url}wp-content/plugins/java/java.json`;

  fetch(javaDataUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Java data not loaded");
      }
      return response.json();
    })
    .then((data) => {
      let markers = [];
      let minlat = 200,
          minlon = 200,
          maxlat = -200,
          maxlon = -200;

      const suggestions = data.map((dataElement) => dataElement.Name);

      // Update suggestions smoothly as the user types
      const debouncedUpdateSuggestions = debounce(updateSuggestions, 300);

      searchInput.addEventListener("input", () => {
        const inputValue = searchInput.value.trim().toLowerCase();
        const filteredSuggestions = suggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(inputValue)
        );
        debouncedUpdateSuggestions(filteredSuggestions, markers, map, suggestionsList, sideContainer);
      });

      data.forEach((dataElement) => {
        if (!dataElement.GPSCoodinates || dataElement.GPSCoodinates.length === 0) {
          return;
        }

        const latitude = dataElement.GPSCoodinates[0];
        const longitude = dataElement.GPSCoodinates[1];

        const customPopup = `
          <img src="https://brand2d.tech/javagroup/wp-content/uploads/2024/05/7663212f1f852b9ccf6479da781bbbe5-min-scaled-e1715182731443.jpg" alt="Java House">
          <b>${dataElement.Name}</b><br>
          <a class="link" href="https://maps.google.com/?q=${latitude},${longitude}">Open Location</a><br>
          <a href="tel:${dataElement.Contact}">${dataElement.Contact}</a>
        `;

        const customOptions = {
          maxWidth: "500",
          className: "stationlocation",
        };

        const stationLocation = [latitude, longitude];

        const marker = L.marker(stationLocation)
          .bindPopup(customPopup, customOptions)
          .addTo(map);

        markers.push({ marker, name: dataElement.Name });

        minlat = Math.min(minlat, latitude);
        minlon = Math.min(minlon, longitude);
        maxlat = Math.max(maxlat, latitude);
        maxlon = Math.max(maxlon, longitude);

        // Add item to sidebar
        const listItem = document.createElement("div");
        listItem.classList.add("sidebar-item");
        listItem.innerHTML = `<b>${dataElement.Name}</b>`;
        listItem.addEventListener("click", () => {
          map.setView(stationLocation, 15);
          marker.openPopup();
          searchInput.value = ""; // Clear the search box
          suggestionsList.innerHTML = ""; // Clear the suggestions list
          fetchAllStations(markers, sidebar, map); // Populate the sidebar with all stations
        });
        sidebar.appendChild(listItem);
      });

      const bounds = L.latLngBounds(L.latLng(minlat, minlon), L.latLng(maxlat, maxlon));
      map.fitBounds(bounds);

      // Adjust zoom to fit markers
      setTimeout(() => {
        map.setZoom(map.getZoom() - 11);
      }, 1);
    })
    .catch((error) => {
      console.error("Error fetching Java data:", error);
    });
}

function updateSuggestions(suggestions, markers, map, suggestionsList, sideContainer) {
  // Clear previous suggestions only if there are new suggestions to show
  if (suggestions.length > 0) {
    const searchResults = document.createElement("div");
    searchResults.classList.add("search-results");

    suggestions.forEach((suggestion) => {
      const listItem = document.createElement("div");
      listItem.textContent = suggestion;
      listItem.classList.add("search-item");
      listItem.addEventListener("click", () => {
        const selectedMarker = markers.find((markerObj) => markerObj.name === suggestion);
        if (selectedMarker) {
          const marker = selectedMarker.marker;
          map.setView(marker.getLatLng(), 15);
          marker.openPopup();
          suggestionsList.innerHTML = ""; // Clear the suggestions list
          fetchAllStations(markers, sidebar, map); // Populate the sidebar with all stations
        }
        sideContainer.style.display = "block";
      });
      searchResults.appendChild(listItem);
    });

    suggestionsList.innerHTML = ""; // Clear previous suggestions
    suggestionsList.appendChild(searchResults);
  } else {
    suggestionsList.innerHTML = ""; // Clear the suggestions list if no suggestions
  }
}


function fetchAllStations(markers, sidebar, map) {
  sidebar.innerHTML = ""; // Clear the sidebar

  markers.forEach((markerObj) => {
    const listItem = document.createElement("div");
    listItem.textContent = markerObj.name;
    listItem.classList.add("sidebar-item");
    listItem.addEventListener("click", () => {
      const marker = markerObj.marker;
      map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    });
    sidebar.appendChild(listItem);
  });
}
