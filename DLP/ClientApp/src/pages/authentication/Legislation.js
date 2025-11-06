import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

const LegislationModal = ({ showModal, setShowModal, instance }) => {
  const { t } = useTranslation();
  const localURL = process.env.REACT_APP_API_URL;
  const basePath =
    window.location.hostname === "localhost" ? localURL : "/";

  // const filesArray = [
  //     {
  //       "id": 1,
  //       "language": "Odluka VM Montrealski 67 15",
  //       "filename": "legislation/Odluka VM Montrealski 67 15.pdf"
  //     },
  //     {
  //       "id": 2,
  //       "language": "Odluka VM Montrealski br. 36 07",
  //       "filename": "legislation/Odluka VM Montrealski br. 36 07.pdf"
  //     },
  //     {
  //       "id": 3,
  //       "language": "Pravilnik o postepenom iskljucivanju supstanci koje ostecu…_0_0",
  //       "filename": "legislation/Pravilnik o postepenom iskljucivanju supstanci koje ostecu…_0_0.pdf"
  //     },
  //     {
  //       "id": 4,
  //       "language": "Zakon o zastiti zraka_72_24",
  //       "filename": "legislation/Zakon o zastiti zraka_72_24.pdf"
  //     }
  //   ]

  const filesArray = [
    {
      id: 1,
      name: "Bosnia and Herzegovina",
      instance: "Brchko",
      language: "Odluka VM Montrealski 67 15",
      filename:
        "legislation/Bosnia and Herzegovina/Odluka VM Montrealski 67 15.pdf",
    },
    {
      id: 2,
      name: "Bosnia and Herzegovina",
      instance: "Brchko",
      language: "Odluka VM Montrealski br. 36 07",
      filename:
        "legislation/Bosnia and Herzegovina/Odluka VM Montrealski br. 36 07.pdf",
    },
    {
      id: 3,
      name: "Federation of Bosnia and Herzegovina",
      instance: "FBIH",
      language:
        "Pravilnik o postepenom iskljucivanju supstanci koje ostecu ozonski omotac",
      filename:
        "legislation/Federation of Bosnia and Herzegovina/Pravilnik o postepenom iskljucivanju supstanci koje ostecu ozonski omotac.pdf",
    },
    {
      id: 4,
      name: "Federation of Bosnia and Herzegovina",
      instance: "FBIH",
      language: "Zakon o zastiti zraka",
      filename:
        "legislation/Federation of Bosnia and Herzegovina/Zakon o zastiti zraka.pdf",
    },
    {
      id: 5,
      name: "Republika Srpska",
      instance: "RS",
      language:
        "Службени Гласник 46 Закон о изменама и допунама закона о заштити ваздуха",
      filename:
        "legislation/Republika Srpska/Службени Гласник 46 Закон о изменама и допунама закона о заштити ваздуха.pdf",
    },
    {
      id: 6,
      name: "Republika Srpska",
      instance: "RS",
      language:
        "Службени Гласник 66 Уредбу о поступању са супстанцама које оштећују озонски омотач и замјенским супстанцама",
      filename:
        "legislation/Republika Srpska/Службени Гласник 66 Уредбу о поступању са супстанцама које оштећују озонски омотач и замјенским супстанцама.pdf",
    },
    {
      id: 7,
      name: "Republika Srpska",
      instance: "RS",
      language: "Службени Гласник 075 ПРАВИЛНИК О СТРУЧНОМ ОСПОСОБЉАВАЊУ",
      filename:
        "legislation/Republika Srpska/Службени Гласник 075 ПРАВИЛНИК О СТРУЧНОМ ОСПОСОБЉАВАЊУ.pdf",
    },
    {
      id: 8,
      name: "Republika Srpska",
      instance: "RS",
      language:
        "Службени Гласник 124 Закон о кому на ним делатностима и Закон о заштити ваздуха",
      filename:
        "legislation/Republika Srpska/Службени Гласник 124 Закон о кому на ним делатностима и Закон о заштити ваздуха.pdf",
    },
  ];

  const getFilteredFiles = () => {
    switch (instance) {
      case "RS":
        return filesArray.filter((file) => file.instance === "RS");
      case "MVTEO":
        return filesArray;
      case "FBIH":
      case "BRCKO":
        return filesArray.filter(
          (file) =>
            file.name === "Bosnia and Herzegovina" ||
            file.name === "Federation of Bosnia and Herzegovina"
        );
      default:
        return [];
    }
  };

  const filteredFiles = getFilteredFiles();

  return (
    <Modal
      title={t("signIn.Legislation", { defaultValue: "Legislation" })}
      visible={showModal}
      width={1000}
      className="Legislation-modal"
      footer={false}
      onCancel={() => setShowModal(!showModal)}
    >
      {/* <div>
        {filteredFiles.map((x) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 10,
            }}
            key={x.id}
          >
            <div onClick={() => window.open(basePath + x.filename, "_blank")}>
              <strong>
                <a>{x.language}</a>
              </strong>
            </div>
          </div>
        ))}
      </div> */}
    </Modal>
  );
};

export default LegislationModal;
