// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2604"; // change this to your cohort!
const RESOURCE = "/events";
const API = BASE + COHORT + RESOURCE;

// === State ===
let parties = [];
let selectedParty;
let guests = [];
let rsvps = [];

// fetch all parties from the API and store them in state
async function getParties() {
  try {
    const response = await fetch(API);
    const result = await response.json();
    parties = result.data;
    render();
  } catch (error) {
    console.error(error);
  }
}

// fetch one party by id and store it in selectedParty
async function getParty(id) {
  try {
    const response = await fetch(`${API}/${id}`);
    const result = await response.json();
    selectedParty = result.data;
    // also fetch guests and rsvps when a party is selected
    await getGuests();
    await getRsvps();
    render();
  } catch (error) {
    console.error(error);
  }
}

// fetch all guests from the API
async function getGuests() {
  try {
    const response = await fetch(`${BASE}${COHORT}/guests`);
    const result = await response.json();
    guests = result.data;
  } catch (error) {
    console.error(error);
  }
}

// fetch all rsvps from the API
async function getRsvps() {
  try {
    const response = await fetch(`${BASE}${COHORT}/rsvps`);
    const result = await response.json();
    rsvps = result.data;
  } catch (error) {
    console.error(error);
  }
}

// === Components ===

// a single party name in the list
// clicking it loads that party's details
function PartyListItem(party) {
  const $li = document.createElement("li");
  $li.innerHTML = `<a href="#selected">${party.name}</a>`;
  // style the selected party differently
  if (selectedParty && selectedParty.id === party.id) {
    $li.classList.add("selected");
  }
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

// a ul with every party as a list item
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");
  const $lis = parties.map(PartyListItem);
  $ul.replaceChildren(...$lis);
  return $ul;
}

// show the guests who rsvp'd to the selected party
function GuestList() {
  // filter rsvps to only ones for the selected party
  const partyRsvps = rsvps.filter((r) => r.eventId === selectedParty.id);
  // match each rsvp to a guest
  const partyGuests = partyRsvps.map((r) =>
    guests.find((g) => g.id === r.guestId),
  );

  const $ul = document.createElement("ul");
  $ul.classList.add("guests");

  // if no guests have rsvp'd yet show a message
  if (partyGuests.length === 0) {
    const $li = document.createElement("li");
    $li.textContent = "No guests have RSVP'd yet.";
    $ul.appendChild($li);
    return $ul;
  }

  // make a list item for each guest
  const $lis = partyGuests.map((guest) => {
    const $li = document.createElement("li");
    $li.textContent = guest ? guest.name : "Unknown guest";
    return $li;
  });
  $ul.replaceChildren(...$lis);
  return $ul;
}

// show details about the selected party
// if none is selected show a message instead
function PartyDetails() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  // format the date so it looks nice
  const date = new Date(selectedParty.date).toLocaleDateString();

  const $section = document.createElement("section");
  $section.classList.add("party");
  $section.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Location:</strong> ${selectedParty.location}</p>
    <p>${selectedParty.description}</p>
    <h4>Guest List</h4>
    <GuestList></GuestList>
  `;
  $section.querySelector("GuestList").replaceWith(GuestList());
  return $section;
}

// === Render ===
// put everything together and mount it onto the page
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <PartyDetails></PartyDetails>
      </section>
    </main>
  `;
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("PartyDetails").replaceWith(PartyDetails());
}

// fetch parties first then render the page
async function init() {
  await getParties();
  render();
}

init();
