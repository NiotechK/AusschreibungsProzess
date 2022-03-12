pragma solidity ^0.8.3; 

import "hardhat/console.sol";
// SPDX-License-Identifier: GPL-3.0
contract ausschreibung {
    
    uint256 ausschreibungsEnde;
    uint256 angebotsZaehler;
    uint256 mge;
    string produkt = "";
    string mail = "";
    //Ersteller des Smart Contracts (Anfrageersteller der Ausschreibung)
    address payable owner;
    
    struct angebot {
        address bieter;
        string angebotsHash;
        uint256 zeitstempel;
    }

    // Man benötigt bei Solidity einen Zaehler, da man bei Mappings nicht iterieren kann
    mapping (address => uint) public indexBieter;
    mapping (uint => angebot) public eingereichteAngebote;

    event angebot_event(uint256 angebotsNummer, address lieferant);

    constructor (string memory _produkt, uint _mge, uint _ausschreibungsEnde, address _owner, string memory _mail) public {
        produkt = _produkt;
        mail = _mail;
        owner = payable(msg.sender);
        mge = _mge;
        ausschreibungsEnde = _ausschreibungsEnde;
        angebotsZaehler = 0;
    }
    
    function angebotEinreichen(string memory angebotsHash) external payable {
        require(block.timestamp < ausschreibungsEnde);
        // Überprüfung, dass die selbe Adresse nicht mehr als ein Angbot einreicht
        require(indexBieter[msg.sender] == 0);
        angebotsZaehler++;
        indexBieter[msg.sender] = angebotsZaehler;
        eingereichteAngebote[angebotsZaehler] = angebot(msg.sender, angebotsHash, block.timestamp);
        emit angebot_event(angebotsZaehler, msg.sender);
    }

    function angeboteAnzeigen () public view returns(uint256) {
        return angebotsZaehler;
    }

    function enddatumAnzeigen() public view returns(uint256) {
        return ausschreibungsEnde;
    }
    function mailAnzeigen() public view returns(string memory) {
        return mail;
    }
    // Kontraktdestruktor
    function destroy() public payable{
        require(msg.sender == owner);
        selfdestruct(owner);
    }
}

contract AusschreibungsErstellung {
    // Speicherung der Kontraktadressen der Ausschreibungen, um später diese zu lesen
    ausschreibung [] public ausschreibungen;
    struct anfrage{
        string artikel;
        uint256 ausschreibungsDauer;
        uint256 mge;
        string mail;
    }
    mapping(ausschreibung => anfrage) public anfragenInformationen;


    function erstellungAusschreibung(string memory artikel, uint256 mge, uint256 ausschreibungsDauer, string memory mail) public{
        // address(this) ist die Adresse des neuen Ausschreibung Kontrakts
        ausschreibung neueAusschreibung = new ausschreibung(artikel, mge, ausschreibungsDauer, address(this), mail);
        ausschreibungen.push(neueAusschreibung);
        anfragenInformationen[neueAusschreibung].artikel = artikel;
        anfragenInformationen[neueAusschreibung].mge = mge;
        anfragenInformationen[neueAusschreibung].ausschreibungsDauer = ausschreibungsDauer;
        anfragenInformationen[neueAusschreibung].mail = mail;
    }

     function angebotEinreichen(ausschreibung _ausschreibung, string memory hash) external {
        _ausschreibung.angebotEinreichen(hash);
    }

    function getVal(uint256 zahl) public view returns (ausschreibung) {
        return ausschreibungen[zahl];
    }

    function zieheArtikelName(uint256 zahl) public view returns (string memory){
        return anfragenInformationen[ausschreibungen[zahl]].artikel;
    }

    function zieheMge(uint256 zahl) public view returns (uint256){
        return anfragenInformationen[ausschreibungen[zahl]].mge;
    }

    function zieheDauer(uint256 zahl) public view returns (uint256){
        return anfragenInformationen[ausschreibungen[zahl]].ausschreibungsDauer;
    }
}