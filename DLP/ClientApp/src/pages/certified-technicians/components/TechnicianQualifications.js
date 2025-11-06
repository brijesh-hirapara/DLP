import { useEffect, useState } from "react";
import { Spin, Alert, Collapse, Form } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { ChangelogWrapper, HorizontalFormStyleWrap } from '../../style'
import { BasicFormWrapper } from '../../../container/styled';
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { CertifiedTechniciansApi } from "api/api";
import moment from "moment";
import { ButtonStyled } from "components/buttons/styled";
import { downloadFilesFromBase64 } from "utility/dowloadFiles";
import QualificationForm, { QualificationViewMode } from "./QualificationForm";
import Heading from "components/heading/heading";
import { H6 } from "components/heading/style";
import { hasPermission } from "utility/accessibility/hasPermission";
import { Link } from "react-router-dom";

const techniciansApi = new CertifiedTechniciansApi();

const Loader = styled.div`
    display: flex; 
    height: 400px;
    width: 600px; 
    justify-content: center; 
    text-
    justifyItems: center; 
    align-items: center
`

const TechnicianQualifications = ({ id, hideAdd = false }) => {
  const [qualifications, setQualifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState();

  const [current, setCurrent] = useState({});
  const { t } = useTranslation();
  const { Panel } = Collapse;
  const [form] = Form.useForm();

  useEffect(() => {
    if (id)
      getQualifications();

    return () => {
    };
  }, [id]);

  const getQualifications = async () => {
    setLoading(true);
    const { data } = await techniciansApi.apiCertifiedTechniciansIdQualificationsGet({ id });
    setQualifications(data?.slice(1));
    setCurrent(data[0]);
    setLoading(false);
  };

  const onHandleEdit = () => {
    const data = {...current};
    data.dateOfExam = moment(current.dateOfExam);
    data.certificateDuration = moment(current.certificateDuration);

    form.setFieldsValue(data);
    setMode(QualificationViewMode.UPDATE);
    setShowPopup(true);
  }

  const onHandleAdd = () => {
    setMode(QualificationViewMode.CREATE);
    form.resetFields();
    setShowPopup(true);
  }

  const renderItemBody = (item) => {
    if (!item) {
      item = current;
    }
    const from = moment(item.dateOfExam).format('DD.MM.YYYY');
    const to = moment(item.certificateDuration).format('DD.MM.YYYY');

    return (
      <div style={{ fontSize: 15 }}>
        <div><FeatherIcon icon="user" size={15} /> {item?.technicianName}</div>
        <div><FeatherIcon icon="mail" size={15} /> {item?.technicianEmail}</div>
        <div><FeatherIcon icon="home" size={15} /> {item?.trainingCenter}</div>
        <div><FeatherIcon icon="calendar" size={15} /> {from} - {to}</div>
        {item.qualificationFiles?.length > 0 && <div>
          <FeatherIcon icon="download-cloud" size={15} />{' '}
          <span onClick={() => downloadFilesFromBase64(item.qualificationFiles)} 
            style={{ textDecoration: 'underline', cursor: 'pointer' }}>Download Files</span>
        </div>}
      </div>
    )
  }
  const renderAlertHeader = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100% !important' }}>
        <strong>{current?.qualificationType} (#{current?.certificateNumber})</strong>
        {hasPermission("registers:add-certified-technicians") && <Link shape="round" type="dark" onClick={onHandleEdit}>Edit</Link>}
      </div>
    )
  }

  const onSubmitQualification = async (data) => {
    data = {...data, certifiedTechnicianId: id, id};
    data.dateOfExam = data.dateOfExam ? moment(data.dateOfExam, "DD.MM.yyyy").format("MM/DD/yyyy") : '';
    data.certificateDuration = data.certificateDuration ? moment(data.certificateDuration, "DD.MM.yyyy").format("MM/DD/yyyy") : '';
    try {
      setIsSaving(true);
      let response;
      if (mode === QualificationViewMode.CREATE)
        response = await techniciansApi.apiCertifiedTechniciansQualificationsAddPost(data);
      else {
        data.qualificationId = current.qualificationId ?? current.id;
        response = await techniciansApi.apiCertifiedTechniciansQualificationsUpdatePost(data);
      }

      if (response.status === 200) {
        await getQualifications();
        setShowPopup(false);
        setMode(QualificationViewMode.VIEW);
      }
    } catch (err) {
      console.log(err);
    } finally { 
      setIsSaving(false);
    }
  }

  return (
    <div style={{display: "flex",flexDirection: 'column'}}>
      {loading ? <Loader ><Spin /> </Loader> :
        <>
          {showPopup && <QualificationForm  
            isSaving={isSaving} 
            form={form}
            mode={mode}
            disabled={mode === QualificationViewMode.UPDATE ? current?.locked : false}
            onFinish={onSubmitQualification}
            title={ mode === QualificationViewMode.UPDATE ? t("technicians:qualifications.title-edit", "Edit Qualification") : t("technicians:qualifications.title-add", "Add Qualification")}
            files={mode === QualificationViewMode.UPDATE ? current?.qualificationFiles : []}
            onOtherButtonClick={() => setShowPopup(false)} 
            otherButtonText="Cancel" 
            finishText="Save" />}


          {!showPopup && <BasicFormWrapper>
            <div style={{width: 600}}>
              <Alert
                showIcon
                banner={false}
                icon={<FeatherIcon icon="award" size={35} />}
                message={renderAlertHeader()}
                description={renderItemBody()}
                type={current?.valid ? 'success' : 'error'}
              />
              <div style={{width: 600, display: 'flex', marginTop: 20, justifyContent: "flex-end"}}>
                {!hideAdd && <ButtonStyled  shape="round" type="dark" onClick={onHandleAdd}>{t("technicians:qualifications.btn-add-new", "Add New")}</ButtonStyled>}
              </div>
              {qualifications && qualifications.length > 0 && <div style={{ marginTop: 25 }}>
                <ChangelogWrapper>
                <Heading as={'h6'}>Previous: </Heading> 
                  <Collapse accordion expandIcon={() => <FeatherIcon icon="clock" size={20} />}>
                    {qualifications.map((item, index) => {
                      return (
                        <Panel
                          style={{ backgroundColor: 'white' }}
                          key={item.id + '__' + index}
                          header={
                            <>
                              <span className="v-num">{item.qualificationType} </span>
                              <span className="rl-date">(#{item.certificateNumber})</span>
                            </>
                          }
                        >
                          {renderItemBody(item)}
                        </Panel>
                      );
                    })}
                  </Collapse>
                </ChangelogWrapper>
              </div>}
            </div>
          </BasicFormWrapper>}
        </>}

    </div>
  )
}

export default TechnicianQualifications;