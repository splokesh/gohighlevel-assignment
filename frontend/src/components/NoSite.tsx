import React from 'react';
import { Button, Card, Empty } from 'antd';
import { useSite } from '../context/SiteContext';

const NoSite: React.FC = () => {
    const { setOpenSiteModal } = useSite()
    return (

        <Card className='h-full'>
            <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{ height: "200px", display: "flex", justifyContent: "center" }}
                description={
                    <p className='text-xl font-bold'>
                        No Site Added
                    </p>
                }
            >
                <Button type="primary" className='my-6' size='large' onClick={() => { setOpenSiteModal(true) }}>Add Site</Button>
            </Empty>
        </Card>
    )
};

export default NoSite;