import { GestureResponderEvent, TouchableOpacity } from "react-native"


export const LinkAccountButton:React.FC<{children:React.ReactNode, onPress: (event:GestureResponderEvent) => void}> = ({children, onPress}) => {

    return (
        <TouchableOpacity
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}
            onPress={onPress}
        >
            {children}
        </TouchableOpacity>
    )

}
