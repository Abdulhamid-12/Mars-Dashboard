const store = Immutable.Map({
  user: Immutable.Map({ name: "Abdulhamid" }),
  apod: "",
  rovers: Immutable.List[("Curiosity", "Opportunity", "Spirit")],
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  // const state = Immutable.merge(store, newState);
  render(root, store);
};

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
  if (name) {
    return `
            <h1>Welcome, ${name}!</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

const render = (root, state) => {
  root.innerHTML = App(state);
  jQuery(function ($) {
    $("#tabsDiv").shieldTabs();
  });
};

// create content
const App = (state) => {
  let { rovers, apod } = state;
  let rover1 = rover2 = rover3 = "";
  let imageOfTheDay = ImageOfTheDay(apod);
  
  if(imageOfTheDay === undefined){
    imageOfTheDay = `<img src="http://localhost:3000/assets/Spin.svg" width=20%/>`
  }
  try {
    rover1 = MarsImage(displayRoversInfo, rovers, 0);
    rover2 = MarsImage(displayRoversInfo, rovers, 1);
    rover3 = MarsImage(displayRoversInfo, rovers, 2);
  } catch (error) {
    rover1 = rover2 = rover3 =`<img src="http://localhost:3000/assets/Spin.svg" width=20%/>`;
    console.log(error);
  }

  return `
        <header></header>
        <main>
        ${Greeting(state.get("user").get("name"))}
            <section>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${imageOfTheDay}
            </section>
            <div id="tabsContainer">
                <div id="tabsDiv">
                    <ul>
                        <li>Rover 1</li>
                        <li>Rover 2</li>
                        <li>Rover 3</li>
                    </ul>
                    <div>
                        ${rover1}
                    </div>
                    <div>
                        ${rover2}
                    </div>
                    <div>
                        ${rover3}
                    </div>
                </div>
            </div>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

const getImageOfTheDay = (state) => {
  let { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => {
      updateStore(store, { apod });
    });

  //   return data;
};

getImageOfTheDay(store);
// ------------------------------------------------------  COMPONENTS

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  if(apod === undefined){
    return;
  }
  const today = new Date();
  const photodate = new Date(apod.date);

  if (!apod || photodate === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
  } else {
    return `
            <img src="${apod.image.url}"  width="50%" />
            <p>${apod.image.explanation}</p>
        `;
  }
};

// ------------------------------------------------------  API CALLS

const getMarsObj = async (state) => {
  let { rovers } = state;

  await fetch(`http://localhost:3000/mars`)
    .then((res) => res.json())
    .then((rovers) => {
      console.log(rovers);
      updateStore(store, { rovers });
    });
};
getMarsObj(store);

// Launch Date
// Landing Date
// Status
// Most recently available photos
// Date the most recent photos were taken
const displayRoversInfo = (marsPhotos, index) => {
  return `
        <div class="container">
            <div class="image">
                <img src="${marsPhotos[index].image_src}" width=50%/>
                <h3>This photo was taken in ${marsPhotos[index].earth_date}</h3>
            </div>
            <div class="text">
              <table>
                  <thead>
                    <tr>
                      <th colspan="3">Inofrmation</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td><h3>Launch Date</h3></td>
                    <td><h3>${marsPhotos[index].Launch_date}</h3></td>
                  </tr>
                  <tr>
                    <td><h3>Landing Date</h3></td>
                    <td><h3>${marsPhotos[index].Landing_date}</h3></td>
                  </tr>
                  <tr>
                    <td><h3>Status</h3></td>
                    <td><h3>${marsPhotos[index].status}</h3></td>
                  </tr>
                </tbody>
              </table>
                
            </div>
        </div>
      `;
};

const getRequiredData = (photos) => {
  const reqData = photos.map((photo) => {
    const earthDate = photo.earth_date;
    const imgSrc = photo.img_src;
    const LaunchDate = photo.rover.launch_date;
    const LandingDate = photo.rover.landing_date;
    const status = photo.rover.status;

    return {
      earth_date: earthDate,
      image_src: imgSrc,
      Launch_date: LaunchDate,
      Landing_date: LandingDate,
      status: status,
    };
  });

  return reqData;
};

const MarsImage = (displayRoversInfo, rovers, i) => {
  console.log(rovers);
  const photos = rovers.image.photos;
  const marsPhotos = getRequiredData(photos);

  return displayRoversInfo(marsPhotos, i);
};
// Object format:
/*{
    "image": {
      "photos": [
        {
          "id": 102693,
          "sol": 1000,
          "camera": {
            "id": 20,
            "name": "FHAZ",
            "rover_id": 5,
            "full_name": "Front Hazard Avoidance Camera"
          },
          "img_src": "http://mars.jpl.nasa.gov/msl-raw-imag.JPG",
          "earth_date": "2015-05-30",
          "rover": {
            "id": 5,
            "name": "Curiosity",
            "landing_date": "2012-08-06",
            "launch_date": "2011-11-26",
            "status": "active"
          }
        },
        ....
      ]
    }
  }*/
