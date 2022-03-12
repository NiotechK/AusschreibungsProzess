import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css';
import emailjs from 'emailjs-com'
import Mailer from "./component/mailer"
import Teilnehmen from './artifacts/contracts/AusschreibungKontrakte.sol/ausschreibung.json'
import Ausschreibung from './artifacts/contracts/AusschreibungKontrakte.sol/AusschreibungsErstellung.json'
import { sha256, sha224 } from 'js-sha256';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'


function App() {
  const [ausschreibungsende, setAuschreibungsende] = useState ('')
  const [produktname, setProduktname] = useState ('')
  const [mge, setMenge] = useState ('')
  const [mail, setMail] = useState('')
  const [email, setEMail] = useState('')
  const [angeboteinreichen, setAngebot] = useState('')
  const [greeting, setGreetingValue] = useState()
  const [preis, setPreis] = useState('')
  const [ausschreibungsadresse, setAusschreibung] = useState('')
  const greeterAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c"
  const ausAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

window.onload = function () {
  fetchA();
}

async function requestAccount() {
  await window.ethereum.request({ method: 'eth_requestAccounts'});
}

async function ausschreibungTeilnehmen(){
  const contractAdresse = ausschreibungsadresse;
  if(typeof window.ethereum !== 'undefined') {
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAdresse, Teilnehmen.abi, signer);
    const transaction = await contract.angebotEinreichen(preisHash());
    setPreis('')
    setAusschreibung('')
    await transaction.wait()
    window.location.reload();
  }
}

function preisHash() {
    let hash = sha256.create();
    hash.update(preis);
    hash.hex();
    hash = sha256(preis);
    alert(hash)
    return hash;
  }

  async function ausschreibungErstellen() {
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, signer);
      let fristEnde = kovertierungInUnix();
      const transaction = await contract.erstellungAusschreibung(produktname, mge, fristEnde, email);
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

  async function fetchA() {
    // Überprüfung ob Metamask installiert ist oder ob der User es verwendet
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, provider)
    let iterate = true;
    let i = 0;
    const daten = []
    while (iterate) {
        
        try {
          const data = await contract.getVal(i)
          const data1 = await contract.zieheArtikelName(i)
          const data2 = await contract.zieheMge(i)
          const data3 = await contract.zieheDauer(i)
          daten.push(data, data1, data2, konvertierungDate(data3))
          
          let list = document.getElementsByTagName("p");
          let tag = document.createElement("p");
          console.log('data: ', daten)
          tag.innerHTML = data+ "\t|\t" + data1+ "\t|\t" +data2+ "\t|\t" + konvertierungDate(data3);
          document.body.appendChild(tag); 
        } catch (err) {
          console.log("Error: ", err)
          iterate = false;
        }
        i++;
      } 
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


    function konvertierungDate(ende) {
      const milliseconds = ende * 1000 
      const dateObject = new Date(milliseconds)
      const humanDateFormat = dateObject.toLocaleString() 
      return humanDateFormat;
    }

    async function sendMail() {
      let _frist= await zieheFrist()
      let _email = await zieheMail()
      _frist = konvertierungDate(_frist)
      const templateParameter = {
          Preis: preis,
          Adresse: ausschreibungsadresse,
          user_email: mail,
          Frist: "" + _frist,
          Ersteller: ""+ _email,
      }
      try{
          ausschreibungTeilnehmen();
          emailjs.send('service_f70zg1e', 'template_fpp51bb', templateParameter,'b0FZ3wiTe2Hn9CZy7' )
          .then(function(response) {
             console.log('SUCCESS!', response.status, response.text);
          }, function(error) {
             alert('FAILED...', error);
          });
      }
      catch{
        alert("Error: Teilnehmen nicht möglich")
      }
        
      }


  return (
    <div className="App">
      <header className="App-header">
  
      <h3>Ausschreibungsprozess starten</h3>
      
        <input
          onChange={e => setAuschreibungsende(e.target.value)}
          placeholder="Auschreibungsdauer in Tage"
          value={ausschreibungsende}
          />
        <input
          onChange={e => setProduktname(e.target.value)}
          placeholder="Artikel"
          value={produktname}
          />
        <input
          onChange={e => setMenge(e.target.value)}
          placeholder="Menge"
          value={mge}
          />
        <input
          onChange={e => setEMail(e.target.value)}
          placeholder="email"
          value={email}
          />
          <button onClick={ausschreibungErstellen}>Ausschreibung Erstellen </button>
          
      <h3>An Ausschreibung Teilnehmen</h3>
      
        <input
          onChange={e => setAusschreibung(e.target.value)}
          placeholder="Aussschreibungs Adresse"
          value={ausschreibungsadresse}
          name="Adresse"
          />
        <input
          onChange={e => setPreis(e.target.value)}
          placeholder="Preis"
          value={preis}
          name ="Preis"
          />
        
        <input
          onChange={e => setMail(e.target.value)}
          placeholder="E-Mail"
          value={mail}
          name="Mail"
          />
    
        <button onClick={sendMail}>Ausschreibung Teilnehmen </button>
      
         
      </header>
    </div>
    
    
  );
}

export default App;
