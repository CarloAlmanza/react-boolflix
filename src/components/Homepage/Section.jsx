import React from 'react';
import Slider from '../Slider/Slider';

const Section = ({ config, data, loading }) => {
    return (
        <Slider
            title={config.title}
            icon={config.icon}
            color={config.color}
            items={data}
            loading={loading}
        />
    );
};

export default Section;