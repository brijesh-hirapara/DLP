import React from "react";
import { Modal,Collapse } from "antd";
import { useTranslation } from "react-i18next";

const customPanelStyle = {
  background: "#F8F9FB",
  borderRadius: 3,
  border: 0,
  overflow: "hidden",
};

const { Panel } = Collapse;

const Faq = ({ faqModal, setfaqModal }) => {
  const { t } = useTranslation();
  return <Modal
    title={t("signIn.FAQ", { defaultValue: "FAQ" })}
    visible={faqModal}
    width={1000}
    className="guildlines-modal"
    footer={false}
    onCancel={() => setfaqModal(!faqModal)}
  >
    {/* <div>
      <Collapse style={{ margin: '20px' }} bordered={false}>
        <Panel
          header="1. Kako pristupiti sistemu upravljanja DLP uređajima? "
          key="1"
          style={customPanelStyle}
          forceRender
        >
          <b>Odgovor:</b>  &nbsp; Pristupate putem web stranice http://dlp.mvteo.gov.ba i odabirete opciju
          "Zahtjev". (Detaljna uputstva možete pronaći u korisničkom priručniku na soodvetnoj
          instance).
        </Panel>
        <Panel
          header="2. Koliko vremena je potrebno za odobrenje pristupa nakon popunjavanja i slanja zahtjeva 
          za registraciju? "
          key="2"
          style={customPanelStyle}
          forceRender
        >
          <b>Odgovor:</b> &nbsp;  Nakon što pošaljete zahtjev, u roku od 48 sati dobit ćete e-mail sa korisničkim 
imenom i privremenom šifrom, koju možete promijeniti prilikom prvog prijavljivanja. 
        </Panel>
        <Panel
          header="3. Šta ako ne dobijem e-mail za potvrdu u predviđenom roku?"
          key="3"
          style={customPanelStyle}
          forceRender
        >
           <span><b>Odgovor:</b> &nbsp; U tom slučaju, kontaktirajte našu podršku putem e-maila ili telefona.</span>
        </Panel>
        <Panel
          header="4. Koji su sljedeći koraci nakon uspješne registracije?"
          key="4"
          style={customPanelStyle}
          forceRender
        >
          <b>Odgovor:</b> &nbsp;  Nakon registracije, potrebno je unijeti podatke o DLP uređajima koje vaša 
kompanija koristi ili plasira na tržište, uključujući serijske brojeve, vrstu uređaja, i sve 
relevantne tehničke specifikacije. 
        </Panel>
        <Panel
          header="5. Da li je potrebno dostaviti podatke za prethodnu godinu? "
          key="5"
          style={customPanelStyle}
          forceRender
        >
          <b>Odgovor:</b> &nbsp; Da, potrebno je dostaviti podatke za prethodnu godinu kako bi sistem bio ažuriran 
i kako bi se osigurala pravilna evidencija o svim uređajima za potrebe izvještavanja. 
        </Panel>
        <Panel
          header="6. Ne mogu otvoriti uputstva na stranici! Šta da radim? "
          key="6"
          style={customPanelStyle}
          forceRender
        >
          <b>Odgovor:</b>&nbsp; Uputstva su u PDF format na soodvetnom jeziku, pa je potrebno imati instaliran 
odgovarajući softver za otvaranje PDF dokumenata.  
        </Panel>
        <Panel
          header="7. Kako promijeniti lozinku? "
          key="7"
          style={customPanelStyle}
          forceRender
        >
          <b>Odgovor:</b>&nbsp; Nakon prve prijave u sistem, možete promijeniti lozinku u bilo kojem trenutku. 
Idite na svoj profil i odaberite opciju "Promjena lozinke". Također, ako zaboravite lozinku, 
možete je promijeniti klikom na "Zaboravljena lozinka" na samoj stranici za prijavu. Nakon 
toga, dobit ćete e-mail s uputama kako to učiniti.  
        </Panel>
        <Panel
          header="8. Da li se moram registrovati ako sam obavezu upravljanja DLP uređajima prenio na 
          drugog operatera? "
          key="8"
          style={customPanelStyle}
          forceRender
        >
          <b>Odgovor:</b>&nbsp; Da, svi subjekti su obavezni da se registruju u sistem i unose svoje podatke, bez 
obzira na to da li su prenijeli obavezu upravljanja uređajima na drugog operatera. To može 
da uradite preku Sistema i da prenesete sopstvenost drugog operatera.
        </Panel>
      </Collapse>
    </div> */}
  </Modal>
}

export default Faq;