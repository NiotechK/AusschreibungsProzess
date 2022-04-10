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
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import { stringify } from 'querystring';


function App() {
  const [ausschreibungsende, setAuschreibungsende] = useState ('')
  const [produktname, setProduktname] = useState ('')
  const [mge, setMenge] = useState ('')
  const [mail, setMail] = useState('')
  const [email, setEMail] = useState('')
  const [einheit, setEinheit] = useState ('Stück')
  const [id, setID] = useState('')
  const [angeboteinreichen, setAngebot] = useState('')
  const [greeting, setGreetingValue] = useState()
  const [preis, setPreis] = useState('')
  const [ausschreibungsadresse, setAusschreibung] = useState('')
  //const greeterAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  let [alphaNumerischeZahl, setZahl] = useState()
  const [waehrung, setWaehrung] = useState('Dollar');
  const ausAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

  
  const options = [
    { label: '$', waehrung: 'Dollar' },
    { label: '€', waehrung: 'Euro' },
  ];

  const optionsEinheit = [
    { label: 'Stck', einheit: 'Stueck' },
    { label: 'Kg', einheit: 'Kilogramm' },
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

async function requestAccount() {
  await window.ethereum.request({ method: 'eth_requestAccounts'});
}

async function ausschreibungTeilnehmen(){
  const contractAdresse = ausschreibungsadresse;
  if((typeof window.ethereum !== 'undefined') && (EmailValidierung(mail) === true)) {
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAdresse, Teilnehmen.abi, signer);
    const transaction = await contract.angebotEinreichen(await angebothashErstellen());
    setPreis('')
    setAusschreibung('')
    await transaction.wait()
    //await versendeEmail()
    window.location.reload();
  }
}

async function angebothashErstellen() {
    let hash = sha256.create();
    alphaNumerischeZahl = Math.random().toString(36).slice(2);

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(ausschreibungsadresse, Teilnehmen.abi, provider)
    let aktuelleAdresse = await contract.aktuelleEOA()
    let nonce = await provider.getTransactionCount(aktuelleAdresse)
   // hash.update(preis);
    //hash.hex();
    alert(preis)
    alert(alphaNumerischeZahl)
    alert(nonce)
    hash = sha256(preis+alphaNumerischeZahl+nonce);
    alert(hash)
    return hash;
  }

async function ausschreibungErstellen() {
    
  if((typeof window.ethereum !== 'undefined') && (EmailValidierung(email) === true)) {
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, signer);
    let fristEnde = kovertierungInUnix();
    const transaction = await contract.erstellungAusschreibung(id,produktname, mge, stringify(einheit).replace(/.*=/, ""), fristEnde, email);
    setAuschreibungsende('')
    setProduktname('')
    setMenge('')
    await transaction.wait()
    window.location.reload();
    }
  }

function kovertierungInUnix () {
    let date = new Date(Date.now() + ( (3600 * 1000 * 24)*ausschreibungsende))
    let timestamp = Math.floor(date / 1000);
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
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          var cell4 = row.insertCell(3);
          var cell5 = row.insertCell(4);
          var cell6 = row.insertCell(5);
          cell1.innerHTML = smartContractAdresse;
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

    async function download(frist, mail, titel) {
      let filename = titel +".xml";
      let text = "<ausschreibung>  \n <kontraktAdresse>" + ausschreibungsadresse + "<\\kontraktAdresse> \n <preis>" + preis + "<\\preis>\n <waehrung>" + stringify(waehrung).replace(/.*=/, "") + "<\\waehrung> \n <frist>" + frist + "<\\frist>\n <email>" + mail + "<\\email> \n <alphaNumerischeZahl>" + alphaNumerischeZahl + "<\\alphaNumerischeZahl> <\\ausschreibung>";
      let file = new File([text], {type: "text/xml"} )
      saveAs(file, filename);

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
      _frist = konvertierungDate(_frist)
      let base64 = await download(_frist, _email, _titel);
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
      ausschreibungTeilnehmen()
      versendeEmail()
    }

    function EmailValidierung(mailadresse){
        var mail_format = new RegExp('^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]$')
        let bool = true;
        if(mail_format.test(mailadresse)) {
        }
        else {
          alert("Email ungültig")
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
              <label>Auschreibungsdauer in Tage</label>
              <input
                onChange={e => setAuschreibungsende(e.target.value)}
                type ="number"
                value={ausschreibungsende}
                />
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
              <Select class="liste" placeholder="Einheit auswählen" options={optionsEinheit} onChange={einheitEinstellen} value={einheit} >
              </Select>
            
            </div>
            <div class="row">
              <label>E-Mail</label>
              <input
                onChange={e => setEMail(e.target.value)}   
                value={email}
                />
            </div>
              <button onClick={ausschreibungErstellen}>Ausschreibung erstellen </button>
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
            <button onClick={teilnehmen}>Ausschreibung teilnehmen </button>
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
