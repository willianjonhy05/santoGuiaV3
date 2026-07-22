import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  MapPin,
  Navigation,
} from 'lucide-react-native';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';


export default function ChurchMapCardHome({
  onPress,
}) {

  return (

    <Pressable

      onPress={onPress}

      style={({pressed}) => [

        styles.card,

        pressed && styles.pressed,

      ]}

    >

      <View style={styles.iconContainer}>

        <MapPin
          size={32}
          color={COLORS.surface}
          strokeWidth={2.4}
        />

      </View>



      <View style={styles.content}>

        <Text style={styles.title}>

          Encontre igrejas próximas

        </Text>


        <Text style={styles.description}>

          Explore igrejas, horários de celebrações
          e encontre o local mais próximo de você.

        </Text>



        <View style={styles.button}>

          <Navigation
            size={16}
            color={COLORS.primary}
          />


          <Text style={styles.buttonText}>

            Abrir mapa

          </Text>

        </View>


      </View>


    </Pressable>

  );

}



const styles = StyleSheet.create({

  card: {

    flexDirection: 'row',

    alignItems: 'center',

    marginHorizontal: SPACING.xs,

    marginVertical: SPACING.md,

    padding: SPACING.md,

    borderRadius: RADIUS.lg,

    backgroundColor: COLORS.primary,

    elevation: 5,

    shadowColor: '#000',

    shadowOffset: {
      width:0,
      height:3,
    },

    shadowOpacity:0.18,

    shadowRadius:5,

  },


  pressed: {

    opacity:0.85,

    transform:[
      {
        scale:0.98
      }
    ],

  },


  iconContainer: {

    width:62,

    height:62,

    borderRadius:31,

    backgroundColor:'rgba(255,255,255,0.18)',

    alignItems:'center',

    justifyContent:'center',

    marginRight:SPACING.md,

  },


  content: {

    flex:1,

  },


  title: {

    color:COLORS.surface,

    fontSize:17,

    fontWeight:'900',

    marginBottom:SPACING.xs,

  },


  description: {

    color:'rgba(255,255,255,0.85)',

    fontSize:13,

    lineHeight:18,

    marginBottom:SPACING.sm,

  },


  button: {

    alignSelf:'flex-start',

    flexDirection:'row',

    alignItems:'center',

    gap:6,

    backgroundColor:COLORS.surface,

    paddingHorizontal:14,

    paddingVertical:7,

    borderRadius:RADIUS.full,

  },


  buttonText: {

    color:COLORS.primary,

    fontSize:13,

    fontWeight:'800',

  },


});