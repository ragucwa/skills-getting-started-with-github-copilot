document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    signUpForActivity();
  });
});

// Fetch activities from API
async function loadActivities() {
  try {
    const response = await fetch("/activities");
    const activities = await response.json();

    displayActivities(activities);
    populateActivitySelect(activities);
  } catch (error) {
    console.error("Error loading activities:", error);
    document.getElementById("activities-list").innerHTML =
      '<p class="error">Error loading activities</p>';
  }
}

// Display activities on the page
function displayActivities(activities) {
  const activitiesList = document.getElementById("activities-list");
  activitiesList.innerHTML = "";

  for (const [name, details] of Object.entries(activities)) {
    const activityCard = document.createElement("div");
    activityCard.className = "activity-card";

    const participantsList = details.participants
      .map((email) => `<li>${email}</li>`)
      .join("");
    const participantsSection =
      details.participants.length > 0
        ? `<div class="participants-section">
                 <h5>Current Participants (${details.participants.length}/${details.max_participants}):</h5>
                 <ul class="participants-list">${participantsList}</ul>
               </div>`
        : `<div class="participants-section">
                 <h5>Current Participants (0/${details.max_participants}):</h5>
                 <p class="no-participants">No participants yet - be the first to sign up!</p>
               </div>`;

    activityCard.innerHTML = `
            <h4>${name}</h4>
            <p><strong>Description:</strong> ${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p><strong>Max Participants:</strong> ${details.max_participants}</p>
            ${participantsSection}
        `;

    activitiesList.appendChild(activityCard);
  }
}

// Populate activity select dropdown
function populateActivitySelect(activities) {
  const select = document.getElementById("activity");
  const defaultOption = select.querySelector('option[value=""]');
  select.innerHTML = "";
  select.appendChild(defaultOption);

  for (const name of Object.keys(activities)) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  }
}

// Handle sign up for activity
async function signUpForActivity() {
  const email = document.getElementById("email").value;
  const activity = document.getElementById("activity").value;
  const messageDiv = document.getElementById("message");

  if (!email || !activity) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(
        email
      )}`,
      {
        method: "POST",
      }
    );

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message, "success");
      document.getElementById("signup-form").reset();
      loadActivities(); // Refresh the activities list
    } else {
      showMessage(result.detail, "error");
    }
  } catch (error) {
    showMessage("Error signing up for activity", "error");
    console.error("Error:", error);
  }
}

// Show message to the user
function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove("hidden");

  setTimeout(() => {
    messageDiv.classList.add("hidden");
  }, 5000);
}
