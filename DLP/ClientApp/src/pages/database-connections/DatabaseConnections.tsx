import React, { useState } from "react";
import { Card, PageHeader, Button } from "antd";
import { CardToolbox } from "container/styled";
import { Main } from "pages/style";
import { useTranslation } from "react-i18next";
import './style.css';
import { DbConnectionHealthApi } from "api/api";

const api = new DbConnectionHealthApi();
const ConnectionCard = ({ title, connectionState, onTestConnection }: any) => {
    const { t } = useTranslation();

    return (
        <Card className="mt-4">
            <div className="connection-card">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" style={{ width: 24, height: 24 }} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                    <p style={{ color: connectionState.isNotTested ? '#000' : connectionState.isSuccess ? '#81D85F' : '#FC585C' }}>
                        {title}
                    </p>
                </div>
                <Button type="default" onClick={onTestConnection}>
                    {
                        connectionState.isNotTested ? t('database-connections:button:test-connection', 'Test Connection') :
                            connectionState.isSuccess ? 'Success' :
                                t('database-connections:button:try-again', 'Try Again')
                    }
                </Button>
            </div>
        </Card>
    );
};

export const DatabaseConnections = () => {
    const { t } = useTranslation();

    const [bosniaHercegovinaConnection, setBosniaHercegovinaConnection] = useState({ isSuccess: false, isNotTested: true });
    const [brckoDistrictConnection, setBrckoDistrictConnection] = useState({ isSuccess: false, isNotTested: true });
    const [republicaSrpskaConnection, setRepublicaSrpskaConnection] = useState({ isSuccess: false, isNotTested: true });
    const [ministryConnection, setMinistryConnection] = useState({ isSuccess: false, isNotTested: true });

    const onTestConnection = async (dbSchema: string, setConnectionState: any) => {
        const response = await api.apiDbConnectionSchemaGet({ schema: dbSchema });
        const isSuccess = response.data;
        setConnectionState({ isSuccess, isNotTested: false });
    };

    return (
        <div>
            <CardToolbox>
                <PageHeader
                    ghost
                    title={t("database-connections.title", "Database Connections")}
                />
            </CardToolbox>

            <Main>
                <ConnectionCard
                    title={t('database-connections:bosnia-i-hercegovina', 'Database for Federacia of Bosnia i Hercegovina')}
                    connectionState={bosniaHercegovinaConnection}
                    onTestConnection={() => onTestConnection('fbih', setBosniaHercegovinaConnection)}
                />
                <ConnectionCard
                    title={t('database-connections:republica-Srpska', 'Database for Republica Srpska')}
                    connectionState={republicaSrpskaConnection}
                    onTestConnection={() => onTestConnection('srpska', setRepublicaSrpskaConnection)}
                />
                <ConnectionCard
                    title={t('database-connections:brcko-district', 'Database for Brcko District')}
                    connectionState={brckoDistrictConnection}
                    onTestConnection={() => onTestConnection('brcko', setBrckoDistrictConnection)}
                />
                <ConnectionCard
                    title={t('database-connections:ministry', 'Database for Ministry')}
                    connectionState={ministryConnection}
                    onTestConnection={() => onTestConnection('ministry', setMinistryConnection)}
                />
            </Main>
        </div>
    );
};
