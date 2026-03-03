import './tag.css'
import { getTextColorForBackground } from '@/lib/utils';

interface TagProps {
  color?: string;
  backgroundColor: string;
  name: string;
}


const Tag = ({ name, backgroundColor, color}: TagProps) => {
  
  const getTagStyles = () => {
    const tagStyle = {
      color: color != null ? color : getTextColorForBackground(backgroundColor),
      backgroundColor: `${backgroundColor}`
    };
    return tagStyle;
  }
  

  return (
    <>
      <span className="tag" style={getTagStyles()}>{name}</span>
    </>
  );
};

export default Tag;
