import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css';
import logo from './abas-logo-rgb.png'
import { saveAs } from 'file-saver';
import emailjs from 'emailjs-com'
import Select from 'react-select';
import Teilnehmen from './artifacts/contracts/AusschreibungKontrakte.sol/ausschreibung.json'
import Ausschreibung from './artifacts/contracts/AusschreibungKontrakte.sol/AusschreibungsErstellung.json'
import { sha256, sha224 } from 'js-sha256';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import { stringify } from 'querystring';
import ReactDOM from 'react-dom';
import { BrowserRouter, BrowserRouter as Routes, Route } from 'react-router-dom';


function App() {
  // http://localhost:3000/?titel=kupfer01&datum=30&artikel=Cu-DHP&menge=500&einheit=Kg&email=mueller@gmail.com
  const queryParams = new URLSearchParams(window.location.search);
  const [ausschreibungsende, setAuschreibungsende] = useState (queryParams.get('datum'))
  const [produktname, setProduktname] = useState (queryParams.get('artikel'));
  const [mge, setMenge] = useState (queryParams.get('menge'))
  const [mail, setMail] = useState('')
  const [email, setEMail] = useState(queryParams.get('email'))
  const [einheit, setEinheit] = useState (queryParams.get('einheit'))
  const [id, setID] = useState(queryParams.get('titel'))
  const [angeboteinreichen, setAngebot] = useState('')
  const [greeting, setGreetingValue] = useState()
  const [preis, setPreis] = useState('')
  const [ausschreibungsadresse, setAusschreibung] = useState('')
  let [alphaNumerischeZahl, setZahl] = useState()
  const [waehrung, setWaehrung] = useState('');
  const [startDate, setStartDate] = useState(datumKonvertieren());
  const ausAddress = "0xba0f979Aac98467A1Fcd1BbC8cb1f808915594d6"
  //const ausAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  let load = document.createElement("div")
  const type = queryParams.get('type');
  

  const options = [
    { label: '$', waehrung: 'Dollar' },
    { label: '€', waehrung: 'Euro' },
  ];

  const optionsEinheit = [
    { label: 'Stck', einheit: 'Stueck' },
    { label: 'Kg', einheit: 'Kg' },
  ];

  const einheitEinstellen = (event) => {
    setEinheit(event);
  }
  const waehrungEinstellen= (event) => {
    let value = stringify(event).replace(/.*=/, "");
    setWaehrung(event);
    
  };
 
window.onload = function () {
  zieheAusschreibungsdaten();
}

function datumKonvertieren() {
  let datum = queryParams.get('datum')
  //alert(datum)
  if(datum !== null) {
    datum = new Date(Date.now() + ( (3600 * 1000 * 24)*datum))
    //alert(datum)
  }
  return datum;
}

async function requestAccount() {
  await window.ethereum.request({ method: 'eth_requestAccounts'});
}
async function ausschreibungTeilnehmen(){
  const contractAdresse = ausschreibungsadresse;
  let transaktionErfolgreich = true
  if((typeof window.ethereum !== 'undefined')) {
    if((felderBefuellt(1) === true) && (EmailValidierung(mail) === true) && (zahlenValidierung(preis) === true)){
      try{
        await requestAccount()
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAdresse, Teilnehmen.abi, signer);
        const transaction = await contract.angebotEinreichen(await angebothashErstellen());
        let btn = document.getElementById("btn2");
        load.classList.add("loader")
        btn.appendChild(load)
        await transaction.wait()
        btn.removeChild(load)
        let antwort = alert("Transaktion ist ausgeführt")
        if (!antwort) {
        window.open("https://ropsten.etherscan.io/address/"+ contractAdresse + "#events", '_blank')
        }
        setPreis('')
        setAusschreibung('')
        setWaehrung('')
        setMail('')
      }
      catch(err){
        alert("Fehler bei Transaktion")
        transaktionErfolgreich = false
      }
      //await bestaetigungsNachricht()
    }
  }
  else {
    let antwort = alert("Bitte installieren Sie Metamask") 
    if (!antwort) {
    window.open("https://metamask.io/", '_blank')
    }
  }
  return transaktionErfolgreich
}

function zahlenValidierung(zahl) {
  let valid = true 
  zahl = Number(zahl)
  if((zahl < 0)) {
    valid = false;
    alert("Negativer Wert in Eingabe")
  }
  return valid;
}

function felderBefuellt(startenOrTeilnehmen) {
  let befuellt = true;
  if(startenOrTeilnehmen === 0) {
    if(id === "") {
      befuellt = false
    }
    else if(mge === "") {
      befuellt = false
    }
    else if(produktname === "") {
      befuellt = false
    }
    else if(einheit === "" || einheit === null  ) {
      befuellt = false
    }
    else if(startDate === "") {
      befuellt = false
    }
    else if(email === "") {
      befuellt = false
    }
  }
  else {
    if(ausschreibungsadresse === "") {
      befuellt = false
    }
    else if(preis === "") {
      befuellt = false
    }
    else if(waehrung === "") {
      befuellt = false
    }
    else if(mail === "") {
      befuellt = false
    }
  }
  if(befuellt === false) {
    alert("Bitte alle Felder befüllen")
  }
  return befuellt;
}

async function angebothashErstellen() {
    let hash = sha256.create();
    alphaNumerischeZahl = Math.random().toString(36).slice(2);
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(ausschreibungsadresse, Teilnehmen.abi, provider)
    let aktuelleAdresse = await contract.aktuelleEOA()
    let nonce = await provider.getTransactionCount(aktuelleAdresse)
    //hash.update(preis);
    //hash.hex();
    hash = sha256(preis+alphaNumerischeZahl+nonce);
    //alert(hash)
    return hash;
  }

async function ausschreibungErstellen() {
    
  if((typeof window.ethereum !== 'undefined')) {
    if((felderBefuellt(0) === true)  && (EmailValidierung(email) === true)  && (zahlenValidierung(mge) === true) && (zahlenValidierung(ausschreibungsende) === true)){
      try{  
        await requestAccount()
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, signer);
        let btn = document.getElementById("btn1");
        let fristEnde = kovertierungInUnix();
        let einheitmge = queryParams.get('einheit')
        if(einheitmge === null) {
          einheitmge = stringify(einheit).replace(/.*=/, "")
        }
        const transaction = await contract.erstellungAusschreibung(id,produktname, mge, einheitmge, fristEnde, email);
        load.classList.add("loader")
        btn.appendChild(load)
        await transaction.wait()
        btn.removeChild(load)
        setAuschreibungsende('')
        setProduktname('')
        setMenge('')
        setEMail('')
        setStartDate('')
        setID('')
        alert("Transaktion ausgeführt")
      }
      catch(err) {
        alert("Fehler bei der Transaktion")
      }
      window.location = window.location.href.split("?")[0];
    }
    }
    else {
      var antwort = alert("Bitte installieren Sie Metamask") 
      if (!antwort) {
      window.open("https://metamask.io/", '_blank')
      }
    }
  }

function kovertierungInUnix () {
    //let date = new Date(Date.now() + ( (3600 * 1000 * 24)*ausschreibungsende))
    //alert(startDate)
    let timestamp = Math.floor(startDate / 1000);
    return timestamp;
}

async function zieheAusschreibungsdaten() {
    // Überprüfung ob Metamask installiert ist oder ob der User es verwendet
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, provider)
    let iterate = true;
    let i = 0;
    
    while (iterate) {
        
        try {
          const smartContractAdresse = await contract.zieheAdresse(i)
          const artikelName = await contract.zieheArtikelName(i)
          const mge = await contract.zieheMge(i)
          const ausschreibungsDauer = await contract.zieheDauer(i)
          const einheit = await contract.zieheEinheit(i)
          const titel = await contract.zieheTitel(i)
          var table = document.getElementById("tabelle");
          var row = table.insertRow(1);
          let btn = document.createElement("button")
          
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          var cell4 = row.insertCell(3);
          var cell5 = row.insertCell(4);
          var cell6 = row.insertCell(5);
          cell1.innerHTML = '<a title="Zeige Smart Contract auf Etherscan.io" target="_blank" href = "https://ropsten.etherscan.io/address/' + smartContractAdresse + '"">' + smartContractAdresse +'</a>';
          cell2.innerHTML = artikelName;
          cell3.innerHTML = mge;
          cell4.innerHTML = einheit;
          cell5.innerHTML = konvertierungDate(ausschreibungsDauer);
          cell6.innerHTML = titel;
        } catch (err) {
          //alert("Error: ", err)
          iterate = false;
        }
        i++;
      } 
    }

    async function download(frist, mail, titel, tnonce) {
      let filename = titel +".xml";
      let text = "<ausschreibung>  \n <kontraktAdresse>" + ausschreibungsadresse + "<\\kontraktAdresse> \n <preis>" + preis + "<\\preis>\n <nonce>" + tnonce + "<\\nonce>\n <waehrung>" + stringify(waehrung).replace(/.*=/, "") + "<\\waehrung> \n <frist>" + frist + "<\\frist>\n <email>" + mail + "<\\email> \n <alphaNumerischeZahl>" + alphaNumerischeZahl + "<\\alphaNumerischeZahl> <\\ausschreibung>";
      let file = new File([text], {type: "text/xml"} )
      //saveAs(file, filename);
      const Buffer = require("buffer").Buffer;
      let encodedAuth = new Buffer(text).toString("base64");
      return encodedAuth;
      }
    
    async function zieheFrist() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(ausschreibungsadresse, Teilnehmen.abi, provider)
      let frist = (await contract.enddatumAnzeigen())
      return frist;
    }
    async function zieheMail() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(ausschreibungsadresse, Teilnehmen.abi, provider)
      let mail = (await contract.mailAnzeigen())
      return mail;
    }
    async function zieheTitel() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(ausschreibungsadresse, Teilnehmen.abi, provider)
      let titel = (await contract.titelAnzeigen())
      return titel;
    }
    async function zieheNonce() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(ausschreibungsadresse, Teilnehmen.abi, provider)
      let aktuelleAdresse = await contract.aktuelleEOA()
      let nonce = await provider.getTransactionCount(aktuelleAdresse)
      return nonce;
    }

    function konvertierungDate(ende) {
      const milliseconds = ende * 1000 
      const dateObject = new Date(milliseconds)
      const humanDateFormat = dateObject.toLocaleString() 
      return humanDateFormat;
    }

    async function versendeEmail () {
      let _frist= await zieheFrist()
      let _email = await zieheMail()
      let _titel = await zieheTitel()
      let _nonce = await zieheNonce()
      _frist = konvertierungDate(_frist)
      let base64 = await download(_frist, _email, _titel, _nonce);
      //alert(base64)
      const templateParameter = {
          Preis: preis,
          Adresse: ausschreibungsadresse,
          user_email: mail,
          Frist: "" + _frist,
          Ersteller: ""+ _email,
          Waehrung: "" + stringify(waehrung).replace(/.*=/, ""),
          Titel: "" +_titel,
          content: base64
      }
      try {
        emailjs.send('service_f70zg1e', 'template_fpp51bb', templateParameter,'b0FZ3wiTe2Hn9CZy7' )
        .then(function(response) {
           console.log('Erfolgreich!', response.status, response.text);
        }, function(error) {
           alert('Fehler...', error);
        });
      }
      catch{
        alert("Error: Teilnehmen nicht möglich")
      }   
    }

    async function teilnehmen(){
      if(await ausschreibungTeilnehmen() === true) {
        versendeEmail()
      }
    }

    function EmailValidierung(mailadresse){
        var mail_format = new RegExp('^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]$')
        let bool = true;
        if(mail_format.test(mailadresse)) {
        }
        else {
          alert("E-Mail Syntax is ungültig")
          bool = false
        }
        return bool;

        }
      
  return (
    <div className="App">
  
      <header className="App-header">
      
      <img src={logo} alt="Logo" />
     
        <div class ="starten">
          <h3>Ausschreibungsprozess starten</h3>
          
          <div class="row">
              <label>Ausschreibungtitel</label>
              <input
                onChange={e => setID(e.target.value)}
                value={id}
                />
            </div>

            <div class="row">
              <label>Auschreibungsende</label>
              <DatePicker selected={startDate} showTimeSelect timeFormat="HH:mm" timeIntervals={15} onChange={(date) => setStartDate(date)} dateFormat="MMMM d, yyyy h:mm aa"/>
            </div>

            <div class="row">
              <label>Artikel</label>
              <input
                onChange={e => setProduktname(e.target.value)}
                value={produktname}
                />
            </div>

            <div class="row">
              <label>Menge</label>
              <input
                onChange={e => setMenge(e.target.value)}
                type="number"
                value={mge}
                />
            </div>
            <div class="row">
              <label>Einheit</label>
              <Select class="liste" placeholder={queryParams.get('einheit')} options={optionsEinheit} onChange={einheitEinstellen} value={einheit} >
              </Select>
            
            </div>
            <div class="row">
              <label>E-Mail</label>
              <input
                onChange={e => setEMail(e.target.value)}   
                value={email}
                />
            </div>
              <button id="btn1" onClick={ausschreibungErstellen}>Ausschreibung erstellen </button>
          </div>
        <div class ="teilnehmen">
          <h3>An Ausschreibung teilnehmen</h3>
          <div class="row">
            <label>Ausschreibungs Adresse</label>
            <input
              onChange={e => setAusschreibung(e.target.value)}
            
              value={ausschreibungsadresse}
              name="Adresse"
              />
          </div>

          <div class="row">
            <label>Preis pro Einheit</label>
            <input
              onChange={e => setPreis(e.target.value)}
              type ="number"
              value={preis}
              name ="Preis"
              />
            <label> Waehrung </label>
            <Select placeholder="Waehrung" options={options} value={waehrung} onChange={ e => waehrungEinstellen(e)}>
              <option value="Dollar">$</option>
              <option value="Euro">€</option>
            </Select>
            
          </div>
          
          <div class="row">
            <label>E-Mail</label>
            <input
              onChange={e => setMail(e.target.value)}
              
              value={mail}
              name="Mail"
              />
          </div>
            <button id="btn2" onClick={teilnehmen}>Ausschreibung teilnehmen </button>
        </div>
      
         
      </header>
      <table id="tabelle">
          <tr>
            <th>Smart Contract Adresse</th>
            <th>Artikel</th>
            <th>Menge</th>
            <th>Einheit</th>
            <th>Ausschreibungsende</th>
            <th>Identifikationsnummer</th>
          </tr>
        
      </table>
      
    </div>
    
    
  );
}

export default App;
