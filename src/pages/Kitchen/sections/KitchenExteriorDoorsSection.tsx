import React, { useState, useMemo, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, IconButton, SimpleGrid, Checkbox } from '@chakra-ui/react';
import { PlusCircle, X } from 'lucide-react';
import { DimensionInputGroup } from 'components/DimensionInputGroup';
import { CustomNumberInput } from 'components/CustomNumberInput';

interface Door { id: number; description: string; materialCost: number; laborCost: number; }
interface ExteriorDoorsDetails { doors: Door[]; }

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenExteriorDoorsSection: React.FC<SectionProps> = ({ initialData, onUpdate }) => {
  const [details, setDetails] = useState<ExteriorDoorsDetails>(initialData?.exteriorDoorsDetails || { doors: [] });
  
  const [doorType, setDoorType] = useState('hinged');
  const [wFt, setWFt] = useState(''); const [wIn, setWIn] = useState('');
  const [hFt, setHFt] = useState(''); const [hIn, setHIn] = useState('');
  const [swing, setSwing] = useState('inswing');
  const [lite, setLite] = useState('none');
  const [sideLites, setSideLites] = useState({ checked: false, qty: '' });
  const [panels, setPanels] = useState('');
  const [isImpact, setIsImpact] = useState(false);

  const totalCost = useMemo(() => details.doors.reduce((sum, door) => sum + door.materialCost + door.laborCost, 0), [details.doors]);
  useEffect(() => { onUpdate({ exteriorDoorsDetails: details }, totalCost); }, [totalCost, details, onUpdate]);

  const resetForm = () => { setWFt(''); setWIn(''); setHFt(''); setHIn(''); setSwing('inswing'); setLite('none'); setSideLites({ checked: false, qty: '' }); setPanels(''); setIsImpact(false); };

  const handleAddDoor = () => {
    let materialCost = 0; const laborCost = 350;
    let description = `${wFt || 0}'${wIn || 0}" x ${hFt || 0}'${hIn || 0}"`;
    
    if (doorType === 'hinged') {
        materialCost = 500 + (sideLites.checked ? (parseInt(sideLites.qty) || 0) * 500 : 0);
        description += `, ${swing}, ${lite} lite, ${sideLites.checked ? `${sideLites.qty} side lite(s)`: 'no side lites'}`;
    } else if (doorType === 'sliding') {
        const heightInches = (parseFloat(hFt) || 0) * 12 + (parseFloat(hIn) || 0);
        const numPanels = parseInt(panels) || 0;
        const panelBaseCost = heightInches >= 84 ? 750 : 400;
        const impactCost = isImpact ? 600 : 0;
        materialCost = numPanels * (panelBaseCost + impactCost);
        description += `, ${panels}-panel sliding, ${isImpact ? 'impact glass' : 'standard glass'}`;
    }
    setDetails(prev => ({ ...prev, doors: [...prev.doors, { id: Date.now(), description, materialCost, laborCost }]}));
    resetForm();
  };

  const handleRemoveDoor = (id: number) => {
    setDetails(prev => ({ ...prev, doors: prev.doors.filter(door => door.id !== id) }));
  };

  return (
    <Box pt={2}><VStack spacing={6} align="stretch">
        <HStack>{['hinged', 'sliding'].map(type => (<Button key={type} onClick={() => setDoorType(type)} flex={1} size="sm" colorScheme={doorType === type ? 'blue' : 'gray'} textTransform="capitalize">{type}</Button>))}</HStack>
        <Box p={4} bg="gray.100" borderRadius="md"><VStack spacing={4}>
            <DimensionInputGroup wFt={wFt} setWFt={setWFt} wIn={wIn} setWIn={setWIn} hFt={hFt} setHFt={setHFt} hIn={hIn} setHIn={setHIn} />
            {doorType === 'hinged' && (<>
                <HStack w="100%"><Button onClick={() => setSwing('inswing')} flex={1} colorScheme={swing === 'inswing' ? 'blue' : 'gray'}>Inswing</Button><Button onClick={() => setSwing('outswing')} flex={1} colorScheme={swing === 'outswing' ? 'blue' : 'gray'}>Outswing</Button></HStack>
                <SimpleGrid columns={3} spacing={2} w="100%"><Button onClick={() => setLite('none')} colorScheme={lite === 'none' ? 'blue' : 'gray'}>No Lite</Button><Button onClick={() => setLite('half')} colorScheme={lite === 'half' ? 'blue' : 'gray'}>Half Lite</Button><Button onClick={() => setLite('full')} colorScheme={lite === 'full' ? 'blue' : 'gray'}>Full Lite</Button></SimpleGrid>
                <Checkbox isChecked={sideLites.checked} onChange={(e) => setSideLites(p => ({...p, checked: e.target.checked}))}>Side Lites ($500/each)</Checkbox>
                {sideLites.checked && <CustomNumberInput label="Qty" value={sideLites.qty} onChange={e => setSideLites(p => ({...p, qty: e.target.value}))} />}
            </>)}
            {doorType === 'sliding' && (<>
                <CustomNumberInput label="Panels" value={panels} onChange={e => setPanels(e.target.value)} subtext="Cost depends on height" />
                <Checkbox isChecked={isImpact} onChange={(e) => setIsImpact(e.target.checked)}>Impact Glass (+$600/panel)</Checkbox>
            </>)}
            <Button onClick={handleAddDoor} colorScheme="blue" leftIcon={<PlusCircle size={20}/>} w="100%">Add Door</Button>
        </VStack></Box>
        <VStack align="stretch" spacing={2}>{details.doors.map((door) => (
            <HStack key={door.id} justify="space-between" bg="white" p={2} borderRadius="md" boxShadow="sm">
                <Text fontSize="sm" w="70%">{door.description}</Text>
                <Box textAlign="right"><Text fontWeight="bold">${(door.materialCost + door.laborCost).toFixed(2)}</Text><Text fontSize="xs" color="gray.500">M:${door.materialCost.toFixed(2)}, L:${door.laborCost.toFixed(2)}</Text></Box>
                <IconButton aria-label="Remove door" icon={<X size={18}/>} onClick={() => handleRemoveDoor(door.id)} size="xs" colorScheme="red" variant="ghost"/>
            </HStack>
        ))}</VStack>
    </VStack></Box>
  );
};