


// Haetaan tallennetut treenit selaimesta
let treenit = [];

try {
    treenit = JSON.parse(localStorage.getItem("treenit")) || [];
    if (!Array.isArray(treenit)) {
        treenit = [];
    }
} catch (error) {
    treenit = [];
}

// Treenien laskurit
let treeniMaara = 0;
let viikonTunnit = 0;


// Tallennetaan viikkotavoite
function tallennaTavoite() {
    const kentta = document.getElementById("tavoite");
    const tavoite = Number(kentta.value);

    kentta.classList.remove("kentta-virhe");

    if (
        kentta.value.trim() === "" ||
        !Number.isInteger(tavoite) ||
        tavoite < 1 ||
        tavoite > 20
    ) {
        kentta.classList.add("kentta-virhe");
        document.getElementById("tulos").textContent =
            "Anna kokonaislukuna tavoite väliltä 1–20.";
        return;
    }

    localStorage.setItem("tavoite", tavoite);

    document.getElementById("tulos").textContent =
        "Viikkotavoitteesi on " + tavoite + " treeniä!";

    paivitaYhteenveto();
}


// Päivitetään tavoitteen prosenttiympyrä
function paivitaTavoiteYmpyra() {
    const tavoite = Number(localStorage.getItem("tavoite")) || 0;

    let prosentti = 0;

    if (tavoite > 0) {
        prosentti = Math.min(
            100,
            Math.round((treeniMaara / tavoite) * 100)
        );
    }

    document.getElementById("tavoiteProsentti").textContent =
        prosentti + "%";

    document.querySelector(".tavoite-ympyra").style.background =
        `conic-gradient(#e04cb6 ${prosentti}%, #454956 ${prosentti}% 100%)`;
}


// Tallennetaan treenit localStorageen
function tallennaTreenit() {
    localStorage.setItem("treenit", JSON.stringify(treenit));
}


// Näytetään kaikki tallennetut treenit
function naytaTreenit() {
    const lista = document.getElementById("treeniLista");
    lista.innerHTML = "";

    treenit.forEach(function(treeni, indeksi) {
        const rivi = document.createElement("li");
        const teksti = document.createElement("span");

        teksti.textContent =
            treeni.tyyppi + " – " +
            treeni.tunnit + " h – " +
            treeni.kuvaus;

        rivi.appendChild(teksti);

        // Lisätään poistopainike jokaiselle treenille
        const poistaPainike = document.createElement("button");
        poistaPainike.type = "button";
        poistaPainike.textContent = "Poista";
        poistaPainike.className = "poista-treeni";
        poistaPainike.setAttribute(
            "aria-label",
            "Poista treeni: " + treeni.tyyppi
        );

        poistaPainike.addEventListener("click", function() {
            treenit.splice(indeksi, 1);
            tallennaTreenit();
            naytaTreenit();
            paivitaYhteenveto();
        });

        rivi.appendChild(poistaPainike);
        lista.appendChild(rivi);
    });
}



// Luodaan paikka kategorioittaiselle yhteenvedolle
function luoKategoriaYhteenveto() {
    let yhteenveto = document.getElementById("kategoriaYhteenveto");

    if (!yhteenveto) {
        yhteenveto = document.createElement("section");
        yhteenveto.id = "kategoriaYhteenveto";

        const otsikko = document.createElement("h3");
        otsikko.textContent = "Tunnit treenityypeittäin";
        yhteenveto.appendChild(otsikko);

        const asettelu = document.querySelector(".workout-layout");
        asettelu.appendChild(yhteenveto);
    }

    return yhteenveto;
}

// Päivitetään kaikki laskurit ja kategoriat
function paivitaYhteenveto() {
    treeniMaara = treenit.length;

    viikonTunnit = treenit.reduce(function(summa, treeni) {
        return summa + Number(treeni.tunnit);
    }, 0);

    document.getElementById("treeniMaara").textContent = treeniMaara;

    document.getElementById("treeniTunnitYhteensa").textContent =
        viikonTunnit.toFixed(2) + " h";

    const tavoite = Number(localStorage.getItem("tavoite")) || 0;
    const jaljella = Math.max(0, tavoite - treeniMaara);

    document.getElementById("treenitJaljella").textContent = jaljella;

    paivitaTavoiteYmpyra();

    // Lasketaan tunnit kategorioittain
    const kategoriat = {};

    treenit.forEach(function(treeni) {
        if (!kategoriat[treeni.tyyppi]) {
            kategoriat[treeni.tyyppi] = 0;
        }

        kategoriat[treeni.tyyppi] += Number(treeni.tunnit);
    });

    const yhteenveto = luoKategoriaYhteenveto();

    // Säilytetään otsikko ja tyhjennetään vanhat tulokset
    yhteenveto.innerHTML = "<h3>Tunnit treenityypeittäin</h3>";

    if (treeniMaara === 0) {
        const teksti = document.createElement("p");
        teksti.textContent = "Lisää treeni, niin näet yhteenvedon.";
        yhteenveto.appendChild(teksti);
        return;
    }

    Object.keys(kategoriat).forEach(function(tyyppi) {
        const tunnit = kategoriat[tyyppi];
        const rivi = document.createElement("p");
        
        rivi.textContent = tyyppi + ": " + tunnit.toFixed(2) + " h";

        yhteenveto.appendChild(rivi);
    });
}


// Tarkistetaan lomake ja lisätään uusi treeni
document.getElementById("treeniLomake").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        const tyyppiKentta = document.getElementById("treeniTyyppi");
        const tunnitKentta = document.getElementById("treeniTunnit");
        const kuvausKentta = document.getElementById("treeniKuvaus");
        const virhe = document.getElementById("virhe");

        const tyyppi = tyyppiKentta.value.trim();
        const tunnitTeksti = tunnitKentta.value.trim();
        const tunnit = Number(tunnitTeksti);
        const kuvaus = kuvausKentta.value.trim();

        // Poistetaan aiemmat virhekorostukset
        [tyyppiKentta, tunnitKentta, kuvausKentta].forEach(function(kentta) {
            kentta.classList.remove("kentta-virhe");
        });

        virhe.textContent = "";

        let virheita = false;

        if (tyyppi === "") {
            tyyppiKentta.classList.add("kentta-virhe");
            virheita = true;
        }

        if (
            tunnitTeksti === "" ||
            !Number.isFinite(tunnit) ||
            tunnit <= 0 ||
            tunnit > 24
        ) {
            tunnitKentta.classList.add("kentta-virhe");
            virhe.textContent =
                "Tuntimäärän pitää olla yli 0 ja enintään 24 tuntia.";
            virheita = true;
        }

        if (kuvaus === "") {
            kuvausKentta.classList.add("kentta-virhe");
            virhe.textContent +=
                (virhe.textContent ? " " : "") +
                "Kirjoita myös treenin kuvaus.";
            virheita = true;
        }

        if (virheita) {
            if (virhe.textContent === "") {
                virhe.textContent = "Valitse treenityyppi.";
            }
            return;
        }

        // Lisätään treeni tallennettavien tietojen joukkoon
        treenit.push({
            tyyppi: tyyppi,
            tunnit: tunnit,
            kuvaus: kuvaus
        });

        tallennaTreenit();
        naytaTreenit();
        paivitaYhteenveto();

        // Tyhjennetään lomake onnistuneen lisäyksen jälkeen
        document.getElementById("treeniLomake").reset();
        virhe.textContent = "";
    }
);


// Poistetaan punainen reunus, kun kenttää korjataan
["tavoite", "treeniTyyppi", "treeniTunnit", "treeniKuvaus"].forEach(
    function(id) {
        const kentta = document.getElementById(id);

        kentta.addEventListener("input", function() {
            kentta.classList.remove("kentta-virhe");
        });

        kentta.addEventListener("change", function() {
            kentta.classList.remove("kentta-virhe");
        });
    }
);


// Palautetaan tallennetut tiedot, kun sivu avataan
const tallennettuTavoite = localStorage.getItem("tavoite");

if (tallennettuTavoite !== null) {
    document.getElementById("tavoite").value = tallennettuTavoite;

    document.getElementById("tulos").textContent =
        "Viikkotavoitteesi on " + tallennettuTavoite + " treeniä!";
}

naytaTreenit();
paivitaYhteenveto();
