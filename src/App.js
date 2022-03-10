import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css';
import Teilnehmen from './artifacts/contracts/AusschreibungKontrakte.sol/ausschreibung.json'
import Ausschreibung from './artifacts/contracts/AusschreibungKontrakte.sol/AusschreibungsErstellung.json'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'


function App() {
  const [ausschreibungsende, setAuschreibungsende] = useState ('')
  const [produktname, setProduktname] = useState ('')
  const [mge, setMenge] = useState ('')
  const [angeboteinreichen, setAngebot] = useState('')
  const [greeting, setGreetingValue] = useState()
  const [preis, setPreis] = useState('')
  const [ausschreibungsadresse, setAusschreibung] = useState('')
  const greeterAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c"
  const ausAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"


/*

  async function fetchGreeting() {
    // Überprüfung ob Metamask installiert ist oder ob der User es verwendet
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
    try {
      const data = await contract.greet()
      console.log('data: ', data)
      window.alert("Contract Adresse: ", data)
    } catch (err) {
      console.log("Error: ", err)
    }

  }

  async function setGreeting() {
    //Überprüung, ob etwas in das Feld geschrieben worden ist
    if(!greeting) return
    // Überprüfung ob Metamask installiert ist 
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract =new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      setGreetingValue('')
      await transaction.wait()
      fetchGreeting()
    }
  }

  <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input onChange={e => setGreetingValue(e.target.value)} 
        placeholder="Set greeting"
        value={greeting} />
*/

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
    const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, signer);
    const transaction = await contract.angebotEinreichen(contractAdresse,"dsfhndfsndf");
    
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    const _signer = provider.getSigner()
    const _contract = new ethers.Contract(contractAdresse, Teilnehmen.abi, _signer);
    const _transaction = await contract.angeboteAnzeigen();
    
    console.log (_transaction);

    setPreis('')
    setAusschreibung('')
    await transaction.wait()
    window.location.reload();
  }

}
  async function ausschreibungErstellen() {
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, signer);
      let fristEnde = kovertierungInUnix();
      const transaction = await contract.erstellungAusschreibung(produktname, mge, fristEnde);
      setAuschreibungsende('')
      setProduktname('')
      setMenge('')
      await transaction.wait()
      window.location.reload();
    }
  }

  function kovertierungInUnix () {
      let timestamp = Math.floor(Date.now() / 1000);
      let milliseconds = ausschreibungsende * 24 * 60 * 60 * 1000;
      return timestamp+milliseconds;
  }
  async function fetchA() {
    // Überprüfung ob Metamask installiert ist oder ob der User es verwendet
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, provider)
    let iterate = true;
    let i = 0;

    while (iterate) {
        try {
          //console.log(i);
          const data = await contract.getVal(i)
          const data1 = await contract.zieheArtikelName(i)
          const data2 = await contract.zieheMge(i)
          const data3 = await contract.zieheDauer(i)
          
          const daten = [data, data1, data2, data3]
          
          let list = document.getElementsByTagName("p");
          
          let tag = document.createElement("p");
          console.log('data: ', daten)
          tag.innerHTML = daten;
          document.body.appendChild(tag); 
          /*
          let button = document.createElement("button");
          let preis = document.createElement ("input");
          preis.placeholder = "Preis";
          preis.type = "number"
          preis.className = "input-"+i;

          button.innerHTML = "Teilnehmen";
          button.className ="teilnehmen"+i;
          document.body.appendChild(tag); 
          document.body.appendChild(button);
          document.body.appendChild(preis);
                
          if(list[i].innerHTML !== daten) {
            //console.log("<p>"+ daten+"</p>")
            console.log("<p>"+ daten+"</p>")
            console.log(list[i])
          }
    
          //var element = document.getElementById("new");
          //element.appendChild(tag);
          //console.log('data: ', data)
          //document.getElementById("CA").innerHTML = daten;
          */
        } catch (err) {
          console.log("Error: ", err)
          iterate = false;
        }
        i++;
      }  
    }
  

  function generiereAusschreibungsAnzeige() {
    
  }



  return (
    <div className="App">
      <header className="App-header">
  
      <h3>Ausschreibungsprozess starten</h3>



        <button onClick={ausschreibungErstellen}>Ausschreibung erstellen </button>
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
      <h3>An Ausschreibung Teilnehmen</h3>
      <button onClick={ausschreibungTeilnehmen}>Ausschreibung Teilnehmen </button>
        <input
          onChange={e => setAusschreibung(e.target.value)}
          placeholder="Aussschreibungs Adresse"
          value={ausschreibungsadresse}
          />
        <input
          onChange={e => setPreis(e.target.value)}
          placeholder="Preis"
          value={preis}
          />
      </header>
    </div>
  );
}

export default App;
