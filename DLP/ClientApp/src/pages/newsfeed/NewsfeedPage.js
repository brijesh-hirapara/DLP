import React, { lazy, useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Button, Switch, Radio } from 'antd';
import { PageHeader } from "../../components/page-headers/page-headers";
import { CardToolbox, Main } from '../../container/styled';
import openNotificationWithIcon from '../../utility/notification';
import InfiniteScroll from 'react-infinite-scroller';
import FeatherIcon from 'feather-icons-react';
import { NewsfeedApi } from 'api/api';
import styled from 'styled-components';
import ComposeMessageModal from './components/ComposeMessageModal';
import { useTranslation } from 'react-i18next';
import PostItem from './components/PostItem';
import moment from 'moment';

const Loader = styled.div`
  display: flex;
  height: 400px;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const newsfeedApi = new NewsfeedApi();

const NewsfeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPageNumber] = useState(1);
  const [totalPosts, setTotalPosts] = useState();
  const [hasNext, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [lastRefresh, setLastRefresh] = useState();
  const [onlySentByMe, setOnlyMine] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadPosts(page === 1);
  }, [page]);

  useEffect(() => { 
    loadPosts(true);
  }, [onlySentByMe])

  const loadPosts = async (isInitial = false, isRefresh = false) => {
    setLoading(isInitial);
    const refreshTime = moment(Date.now()).format("DD.MM.yyyy hh:mm:ss A");

    try {
      const { data } = await newsfeedApi.apiNewsfeedGet({ pageNumber: isRefresh ? 1 : page, pageSize: 10, onlySentByMe });
      setPosts(isInitial ? data.items : [...posts, ...data.items]);

      setTotalPosts(data.totalCount)
      setHasNextPage(data.hasNextPage);
      setPageNumber(data.hasNextPage ? data.pageIndex + 1 : page);

      setLastRefresh(refreshTime);

    } catch (ex) {
      console.log(ex);
    } finally {
      setLoading(false);
    }
  }

  const ComposeModal = () => {
    if (!showCompose) return null;

    const onSubmitSuccess = () => {
      setShowCompose(false);
      loadPosts(true);
      openNotificationWithIcon(
        "success",
        t("newsfeed:notification-post-success", "Message Successfully Sent"),
        t("newsfeed:pnotification-post-description-success", "Message Was Successfully Sent to the Selected User Groups")
      );
    }

    return <ComposeMessageModal onSubmitSuccess={(onSubmitSuccess)} onCancel={() => setShowCompose(false)} />
  };

  const LoadingIndicator = () => {
    if (!loading) return null;
    return (
      <Loader>
        <Spin />
      </Loader>
    );
  };

  const PostsList = () => {
    if (loading || !posts?.length) return null;
    return (
      <InfiniteScroll
        pageStart={1}
        loadMore={() => hasNext && loadPosts(false)}
        hasMore={hasNext}
        loader={
          <div className="loader" key={0}>
            <div className="spin" style={{ height: 'auto', marginTop: 50 }}>
              <Spin style={{ alignSelf: 'center' }} />
            </div>
          </div>
        }
      >
        {posts.map(post => <PostItem {...post} key={post.id} />)}
      </InfiniteScroll>
    );
  };

  const EmptyMessage = () => {
    if (loading || posts?.length !== 0) return null;
    return (
      <Empty description="No available messages found!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };


  return (
    <>
      <CardToolbox>
        <PageHeader
          key={lastRefresh}
          ghost
          title={t("newsfeed.title", "Newsfeed")}
          subTitle={<div>
            {totalPosts ? <div>{t("newsfeed.total-msg", "Total messages") + ': ' + totalPosts}</div> : null}
            {lastRefresh ? <div>{t("newsfeed.last-time-refreshed", "Last refresh") + ': ' + lastRefresh}</div> : null}
          </div>}
          buttons={[<Radio.Group
            name="filterKey"
            onChange={(e) => setOnlyMine(e.target.value)}
            value={onlySentByMe}
          >
            <Radio.Button key={"ExlusivetoMyGroup"} value={false}>
              {t("equipments:radio.exclusive-to-my-group", "Exclusive to me")}
            </Radio.Button>
            <Radio.Button key={"OnlySentByMe"} value={true}>
              {t("equipments:radio.only-sent-by-me", "Sent by me")}
            </Radio.Button>
          </Radio.Group>,
          <div className="page-header-actions">
            <Button
              onClick={() => setShowCompose(true)}
              className="btn-add_new"
              type="primary"
            >
              <FeatherIcon icon="send" style={{ height: 20 }} />{' '}
              {t("newsfeed:button-compose-msg", "Compose Message")}
            </Button>
          </div>
          ]}
        />
      </CardToolbox>
      <Main>
        <Row gutter={20}>
          <Col md={24}>
            <ComposeModal />
            <LoadingIndicator />
            <PostsList />
            <EmptyMessage />
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default NewsfeedPage;