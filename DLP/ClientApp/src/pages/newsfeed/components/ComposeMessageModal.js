/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useContext, useState, useEffect } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Button, Form, Input, Modal, Select, Upload } from 'antd';
import { CreatePost } from './style';
import styled, { css } from 'styled-components';
import TextArea from 'antd/lib/input/TextArea';
import { Cards } from 'components/cards/frame/cards-frame';
import { BasicFormWrapper } from 'container/styled';
import { NewsfeedApi } from 'api/api';
import { useTranslation } from "react-i18next";

const { Option } = Select;

const ContentArea = styled(TextArea)`
  border: 1px solid #f0f0f0 !important;
`;
const StyledBtn = styled(Button)`
  height: 35px !important;
  background: #ecf2ff;
`;
const newsfeedApi = new NewsfeedApi();

const ComposeMessageModal = ({ onSubmitSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [myAudience, setMyAudience] = useState([]);

  const handleOnSubmit = async (data) => {
    try {
      await newsfeedApi.apiNewsfeedPost({ createNewPostCommand: data });
      onSubmitSuccess?.();
      form.resetFields();
    } catch (err) {

    }
  };

  useEffect(() => {
    const fetchMyAudience = async () => {
      const { data } = await newsfeedApi.apiNewsfeedMyAudienceGet();
      setMyAudience(data);
    }
    fetchMyAudience();
  }, []);

  return (
    <Modal
      type={"primary"}
      title={t(`newsfeed:compose-message-title`, `Compose new message`)}
      open={true}
      style={{ width: 600 }}
      onCancel={onCancel}
      footer={null}
    >
      <BasicFormWrapper>
        <Form

          requiredMark
          form={form}
          name={"add-post"}
          onFinish={handleOnSubmit}
        >
          <div>
            <Form.Item
              name="subject"
              label={t('newsfeed:label-subject', 'Subject')}
              required
              rules={[
                {
                  required: true,
                  message: "Please write something",
                },
              ]}
            >
              <div className="postBody">
                <Input placeholder="Subject" />
              </div>
            </Form.Item>
            <Form.Item
              name="content"
              label={t("newsfeed:content-label", "Content")}
              required
              rules={[
                {
                  required: true,
                  message: "Please write something",
                },
              ]}
            >
              <div className="postBody">
                <ContentArea
                  rows={3}
                  placeholder="Content"
                />
              </div>
            </Form.Item>
            <Form.Item
              name="postAudiences"
              label="Audience"
              required
              rules={[
                {
                  required: true,
                  message: "Please select at least one user group",
                },
              ]}
            >
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Please select Audience"
                className="basic-multi-select"
              >
                {myAudience &&
                  myAudience.map((item) => (
                    <Option value={item?.id} key={item?.name}>
                      {item?.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <div className="postFooter" style={{ border: 0 }}>
              <div className='postFooter_left' />
              <div className="postFooter_right" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  htmlType='submit'
                  className="btn-post"
                  type="primary"
                  disabled={false}
                >
                  {t('newsfeed:button-share', 'Share Message')}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </BasicFormWrapper>
    </Modal>
  );
};

export default ComposeMessageModal;