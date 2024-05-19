import React, { useEffect, useState } from "react";
import validator from "validator";
import { Button, Input, message, Modal } from "antd";
import { useSite } from "../context/SiteContext";
import { createSite } from "../api";

const SiteForm: React.FC = () => {
    const { openSiteModal, setOpenSiteModal, fetchSites } = useSite();
    const [name, setName] = useState("");
    const [errorNameMsg, setErrorNameMsg] = useState("");
    const [url, setUrl] = useState("");
    const [errorUrlMsg, setErrorUrlMsg] = useState("");
    const [loading, setLoader] = useState(false);

    const validateName = () => {
        if (!name) {
            setErrorNameMsg("Mandatory field");
        } else if (name.length < 5) {
            setErrorNameMsg("Mininum charactor 5");
        } else if (name.length > 300) {
            setErrorNameMsg("Maximum charactor 300");
        } else {
            setErrorNameMsg("");
        }
    };

    useEffect(() => {
        setName("")
        setUrl("")
        setErrorNameMsg("")
        setErrorUrlMsg("")
        setLoader(false)
    }, [])
    const validateUrl = () => {
        if (!url) {
            setErrorUrlMsg("Mandatory field");
        } else if (
            !validator.isURL(url, {
                require_protocol: true,
                protocols: ["http", "https"],
                require_host: true,
                require_port: false,
                require_valid_protocol: true,
            })
        ) {
            setErrorUrlMsg("Invalid Url");
        } else {
            setErrorUrlMsg("");
        }
    };

    const handleName = ({ target: { value } }) => { setName(value) }
    const handleUrl = ({ target: { value } }) => { setUrl(value) }

    const handleOk = () => {
        setLoader(true)
        validateName();
        validateUrl()

        if (errorUrlMsg || errorNameMsg) {
            setLoader(false)
            return
        }

        // Call Api to create
        createSite({ name, url }).then((data) => {
            console.log(data)
            fetchSites()
            message.success('Site Added')
        }).catch(e => {
            console.error(e)
            if (e?.response?.status === 400) {
                message.error(e?.response?.data?.message || 'Bad request')
            } else {
                message.error('Error occured while adding site')
            }
        }).finally(() => {
            console.log("FINALLY")

            setOpenSiteModal(false)
        })

    };

    const handleCancel = () => {
        setOpenSiteModal(false)
    };

    return (
        <>
            <Modal
                title="Site Knowledge Creation"
                open={openSiteModal}
                onOk={handleOk}
                onCancel={handleCancel}
                closable={false}
                maskClosable={false}
                footer={[]}
            >
                <form>
                    <div className="mt-3">
                        <label className="text-sm ">Name</label>
                        <Input
                            placeholder="Enter Site Name"
                            className="mt-1"
                            size="large"
                            status={errorNameMsg ? "error" : undefined}
                            onChange={handleName}
                            onBlur={() => { validateName() }}
                            disabled={loading}
                        />
                        {Boolean(errorNameMsg) && (
                            <p className="text-xs text-red-400 mt-1">{errorNameMsg}</p>
                        )}
                    </div>
                    <div className="mt-3 mb-5">
                        <label className="text-sm ">Url</label>
                        <Input
                            placeholder="http://example.com/blog/1"
                            className="mt-1"
                            size="large"
                            status={errorUrlMsg ? "error" : undefined}
                            onChange={handleUrl}
                            onBlur={() => { validateUrl() }}
                            disabled={loading}
                        />
                        {Boolean(errorUrlMsg) && (
                            <p className="text-xs text-red-400 mt-1">{errorUrlMsg}</p>
                        )}
                    </div>
                </form>
                <div className="flex items-end justify-end space-x-2">
                    <Button key="cancel" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button key="submit" type="primary" onClick={handleOk} loading={loading} disabled={loading || !!errorUrlMsg || !!errorNameMsg}>
                        Submit
                    </Button>
                </div>
            </Modal >
        </>
    );
};

export default SiteForm;
