import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  SPACING,
} from '../constants/theme';


export default function ClericCard({
  cleric,
  onPress,
}) {

  return (
    <Pressable
      onPress={onPress}
      style={({pressed})=>[
        styles.card,
        pressed && {
          opacity:0.7
        }
      ]}
    >

      {
        cleric.foto_url ? (
          <Image
            source={{
              uri: cleric.foto_url
            }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (

          <View style={styles.photoFallback}>
            <Ionicons
              name="person-outline"
              size={35}
              color={COLORS.primary}
            />
          </View>

        )
      }


      <View style={styles.info}>

        <Text style={styles.name}>
          {cleric.nome}
        </Text>


        {
          cleric.titulo ? (
            <Text style={styles.title}>
              {cleric.titulo}
            </Text>
          ) : null
        }


        {
          cleric.oficio ? (
            <Text style={styles.office}>
              {cleric.oficio}
            </Text>
          ) : null
        }


        <Text style={styles.order}>
          {cleric.grau_ordem}
        </Text>

      </View>


      <Ionicons
        name="chevron-forward"
        size={22}
        color={COLORS.textMuted}
      />


    </Pressable>
  );
}



const styles = StyleSheet.create({

  card:{
    flexDirection:'row',
    alignItems:'center',
    padding:SPACING.md,
    marginBottom:SPACING.sm,
    borderRadius:16,
    backgroundColor:COLORS.surface,
    borderWidth:1,
    borderColor:COLORS.border,
  },


  photo:{
    width:70,
    height:70,
    borderRadius:35,
  },


  photoFallback:{
    width:70,
    height:70,
    borderRadius:35,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:COLORS.border,
  },


  info:{
    flex:1,
    marginLeft:SPACING.md,
  },


  name:{
    color:COLORS.text,
    fontSize:16,
    fontWeight:'900',
  },


  title:{
    marginTop:3,
    color:COLORS.primary,
    fontSize:13,
    fontWeight:'700',
  },


  office:{
    marginTop:5,
    color:COLORS.textMuted,
    fontSize:12,
    lineHeight:17,
  },


  order:{
    marginTop:6,
    color:COLORS.text,
    fontSize:12,
    fontWeight:'800',
  },

});