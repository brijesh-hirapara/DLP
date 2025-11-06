
import { Card, Col, PageHeader, Row, Spin } from "antd";
import { CardToolbox, Main } from "container/styled";
import PostItem from "pages/newsfeed/components/PostItem";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardApi, NewsfeedApi } from 'api/api';
import styled from "styled-components";

const newsfeedApi = new NewsfeedApi();
const dashboardApi = new DashboardApi();

const Loader = styled.div`
    display: flex; 
    height: 400px;
    width: '100%'; 
    justify-content: center; 
    justifyItems: center; 
    align-items: center
`

export const Dashboard = () => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const PostsList = () => {
        return (
            posts.map((post: any) => <PostItem {...post} key={post.id} />)
        );
    };

    const getData = async () => {
        const { data: myNotifications } = await newsfeedApi.apiNewsfeedGet({ pageNumber: 1, pageSize: 3, onlySentByMe: false }) as any;
        setPosts(myNotifications?.items);

        const { data } = await dashboardApi.apiDashboardPlainStatsGet();
        setStats(data);

        setIsLoading(false);
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <div>
            {isLoading ? <Loader><Spin /> </Loader> : 
            <>

            <CardToolbox>
                <PageHeader
                    ghost
                    title={t("dashboard.title", "Dashboard")}
                />
            </CardToolbox>
            <Main>

                {/* <Row gutter={[15, 15]}>
                    <Col lg={6} md={12} xs={24}>
                        <Card>
                            <div className="flex">
                                <h3 style={{ fontSize: 22, fontWeight: '600' }}>{stats?.totalPendingRequests}</h3>
                                <p style={{ fontSize: 14, color: '#868eae' }}>
                                    {t('dashboard:total-pending-requests', 'Total Pending Requests')}
                                </p>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={6} md={12} xs={24}>
                        <Card>
                            <div className="flex">
                                <h3 style={{ fontSize: 22, fontWeight: '600' }}>{stats?.totalServiceCompanies}</h3>
                                <p style={{ fontSize: 14, color: '#868eae' }}>
                                    {t('dashboard:total-service-companies', 'Total Service Companies')}
                                </p>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={6} md={12} xs={24}>
                        <Card>
                            <div className="flex">
                                <h3 style={{ fontSize: 22, fontWeight: '600' }}>{stats?.totalActiveTechnicians}</h3>
                                <p style={{ fontSize: 14, color: '#868eae' }}>
                                    {t('dashboard:total-active-technicians', 'Total Active Technicians')}
                                </p>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={6} md={12} xs={24}>
                        <Card>
                            <div className="flex">
                                <h3 style={{ fontSize: 22, fontWeight: '600' }}>{stats?.totalActiveEquipments}</h3>
                                <p style={{ fontSize: 14, color: '#868eae' }}>
                                    {t('dashboard:total-active-equipments', 'Total Active Equipment')}
                                </p>
                            </div>
                        </Card>
                    </Col>
                </Row> */}
                <div style={{ marginTop: 50 }}></div>
                <PageHeader
                    ghost
                    title={t("dashboard.last-3-notification", "Last 3 notifcations")}
                    style={{marginLeft: -25}}
                />
                <PostsList />
            </Main></>}
        </div>)
}