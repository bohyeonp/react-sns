import React, {useEffect, useState} from 'react';
import { Layout, Carousel} from 'antd';
import {firestore} from "../../firebase/Firebase";
const { Footer } = Layout;

const contentStyle = {
    height: '140px',
};

const imageStyle = {
    width:'100%',
    height:'100%',
    objectFit:'cover',
    borderRadius: '10px'

};

function FooterC() {
    const [banner, setBanner] = useState([]);

    useEffect(() => {
        getBannerList();
    }, []);

    const getBannerList = async () => {
        const banner = firestore.collection("banner");
        let bannerList = [];
        await banner.get().then((docs) => {
            docs.forEach((doc) => {
                bannerList.push(doc.data().url);
            });
            setBanner(bannerList);
        });
    };

    return (
        <Footer style={{textAlign: 'center',}}>
            <Carousel autoplay effect="fade" autoplaySpeed={10000}>
                {banner.map((image, index) => (
                    <div key={index} >
                        <h3 style={contentStyle}>
                            <img
                                style={imageStyle}
                                src={image}
                                alt=""
                            />
                        </h3>
                    </div>
                ))}
            </Carousel>
        </Footer>
    );
}

export default FooterC;
