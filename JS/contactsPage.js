const addContact = () => {
  const details = [
    {
      key: "Jane Doe",
      value: "Girlfriend"
    },
    {
      key: "Phone Number",
      value: "+91-8888888888"
    },
    {
      key: "Email ID",
      value: "jane.doe@example.com"
    }
  ];

  let container = document.getElementById("contactContainer");

  let cardBox = document.createElement("div");
  cardBox.classList.add("card-box");

  let image = document.createElement("img");
  image.classList.add("profile-picture");
  image.setAttribute("alt", "user");
  image.setAttribute("src", "../assets/user.png");
  cardBox.appendChild(image);

  for (let i = 0; i < details.length; ++i) {
    let infoColumn = document.createElement("div");
    infoColumn.classList.add("info-column");

    let boldName = document.createElement("b");
    boldName.appendChild(document.createTextNode(details[i].key));

    let name = document.createElement("span");
    name.appendChild(boldName);

    let relation = document.createElement("span");
    relation.appendChild(document.createTextNode(details[i].value));

    infoColumn.appendChild(name);
    infoColumn.appendChild(relation);
    cardBox.appendChild(infoColumn);
  }

  container.appendChild(cardBox);
};

const toggleMenu = () => {
  let menuIcon = document.getElementsByClassName("menu-icon-container")[0];
  let cross = document.getElementsByClassName("menu-cross-container")[0];
  let menuContainer = document.querySelector(".menu-container");

  menuIcon.style.display = menuIcon.style.display === "none" ? "block" : "none";
  cross.style.display = cross.style.display === "none" ? "block" : "none";
  menuContainer.style.display =
    menuContainer.style.display === "none" ? "block" : "none";
};

window.addEventListener("resize", () => hideMobileMenu());

const hideMobileMenu = () => {
  if (window.outerWidth > 1250) {
    let menuContainer = document.querySelector(".menu-container");
    if (menuContainer.style.display !== "none") {
      menuContainer.style.display = "none";
      let menuIcon = document.getElementsByClassName("menu-icon-container")[0];
      let cross = document.getElementsByClassName("menu-cross-container")[0];

      menuIcon.style.display = "block";
      cross.style.display = "none";
    }
  }
};
