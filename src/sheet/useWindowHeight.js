import { useEffect, useState } from 'react';

const useWindowHeight = () => {
    const [windowHeight, setWindowHeight] = useState(() => window.innerHeight);

    useEffect(() => {
        const onResize = ({ target: { innerHeight } }) => {
            setWindowHeight(innerHeight);
        };

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return windowHeight;
};

export default useWindowHeight;
