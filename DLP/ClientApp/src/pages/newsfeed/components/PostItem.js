/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Row, Col, Popover, Button, Collapse, Alert } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AllPosts, Title } from './style';
import FeatherIcon from 'feather-icons-react';
import styled from 'styled-components';
import { Cards } from 'components/cards/frame/cards-frame';
const { Panel } = Collapse;

const StyledPanel = styled(Panel)`background: white !important`

const Available = ({ title, date }) => {
  return (<div style={{ display: 'flex', flexDirection: 'column', minWidth: 150 }}>
    <span>{title}</span>
    <strong style={{ display: 'flex', alignItems: 'center' }}><FeatherIcon size={14} style={{ marginRight: 10 }} icon="clock" />{moment(date).format('h:mm:ss A')}</strong>
    <strong style={{ display: 'flex', alignItems: 'center' }}><FeatherIcon size={14} style={{ marginRight: 10 }} icon="calendar" />{moment(date).format('DD-MMM-YYYY')}</strong>
  </div>)
}

const PostItem = ({
  subject,
  createdAt,
  createdBy,
  organizationOfCreator,
  content,
}) => {

  return (
      <AllPosts>
        <Cards
          title={
            <Row>
              <Col lg={14} md={13}>
                <Title style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <img src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" alt="" />
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginTop: 9 }}>
                    <p>{subject}</p>
                    <div style={{ fontSize: 12, padidng: 0, margin: 0 }}>
                      {moment(createdAt).format('DD-MMM-YYYY, h:mm:ss A')}
                    </div>
                  </div>
                </Title>
              </Col>
              <Col lg={10} md={11} style={{ display: 'flex', justifyContent: 'flex-end', background: 'white !important', marginTop: 10 }}>
  
                <Badge
                  className={`ant-badge badge`}
                  color='#B6C8F0'
                  count={`${createdBy}`}
                />
                 <Badge
                  className={`ant-badge badge`}
                  color='#99A9D7'
                  count={`${organizationOfCreator}`}
                />
              </Col>
            </Row>
          }
        >
          <div className="post-content">
            <div className="post-text" style={{ borderBottom: 'none' }}>
              <p>{content}</p>
            </div>
          </div>
        </Cards>
      </AllPosts>
  );
};

PostItem.propTypes = {
  id: PropTypes.number,
  images: PropTypes.array,
  content: PropTypes.string,
  author: PropTypes.string,
};

export default PostItem;