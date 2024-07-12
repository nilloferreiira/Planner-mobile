import { Input } from "@/components/input";
import {
  ArrowRight,
  AtSign,
  CalendarIcon,
  MapPin,
  Settings2,
  UserRoundPlus,
} from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Alert, Image, Keyboard, Text, View } from "react-native";
import { Button } from "@/components/button";
import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";
import { GuestEmail } from "@/components/email";
import { validateInput } from "@/utils/validateInput";
import { tripStorage } from "@/storage/trip";
import { router } from "expo-router";
import { tripServer } from "@/server/trip-server";
import { Loading } from "@/components/loading";

enum StepForm {
  TRIP_DETAILS = 1,
  AT_EMAIL = 2,
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function Index() {
  //Loading
  const [isCreatingTrip, setIsCreatingTrip] = useState<boolean>(false);

  //Steps
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
  const [destination, setDestination] = useState("");

  function handleNextStepForm() {
    if (
      destination.trim().length === 0 ||
      !selectedDates.startsAt ||
      !selectedDates.endsAt
    ) {
      return Alert.alert(
        "Detalhes da viagem",
        "Preencha todos as informações da viagem."
      );
    }

    if (destination.length < 4) {
      return Alert.alert(
        "Detalhes da viagem",
        "O destino deve ter pelo menos 4 caracteres."
      );
    }

    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.AT_EMAIL);
    }

    Alert.alert("Nova viagem", "Confirmar viagem?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        onPress: createTrip,
      },
    ]);
  }

  //Modal
  const [showModal, setShowModal] = useState(MODAL.NONE);

  //Dates
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  }

  //Guests
  const [emailToInvite, setEmailToInvite] = useState("");
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([]);

  function handleRemoveEmail(emailToRemove: string) {
    setEmailsToInvite((prevState) =>
      prevState.filter((email) => email !== emailToRemove)
    );
  }

  function handleAddEmail() {
    if (!validateInput.email(emailToInvite)) {
      return Alert.alert("Convidado", "E-mail inválido!");
    }

    const emailAlreadyExists = emailsToInvite.find(
      (email) => email === emailToInvite
    );
    if (emailAlreadyExists) {
      return Alert.alert(
        "Convidado",
        "Este e-mail já está na lista de convidados!"
      );
    }

    setEmailsToInvite((prevState) => [...prevState, emailToInvite]);
    setEmailToInvite("");
  }

  //Trip
  const [isGettingTrip, setIsGettingTrip] = useState<boolean>(true);

  async function saveTrip(tripId: string) {
    try {
      await tripStorage.save(tripId);
      router.navigate(`/trip/${tripId}`);
    } catch (e) {
      Alert.alert(
        "Salvar Viagem",
        "Não foi possível salvar o id da viagem no dispositivo!"
      );
      console.log(e);
    }
  }

  async function createTrip() {
    try {
      setIsCreatingTrip(true);

      // atualizar as datas usando o dayjs e toString() 
      const newTrip = await tripServer.create({
        destination,
        starts_at: selectedDates.startsAt?.dateString!,
        ends_at: selectedDates.endsAt?.dateString!,
        emails_to_invite: emailsToInvite,
      });

      Alert.alert("Nova viagem", "Viagem criada com sucesso!", [
        {
          text: "OK. Continuar.",
          onPress: () => saveTrip(newTrip.tripId),
        },
      ]);
    } catch (e) {
      setIsCreatingTrip(false);
      console.log(e);
    }
  }

  async function getTrip() {
    try {
      const tripId = await tripStorage.get();

      if (!tripId) {
        return setIsGettingTrip(false);
      }

      const trip = await tripServer.getById(tripId);

      if (trip) {
        return router.navigate(`/trip/${tripId}`);
      }
    } catch (e) {
      setIsGettingTrip(false);
      console.log(e);
    }
  }

  useEffect(() => {
    getTrip();
  }, []);

  if (isGettingTrip) {
    return <Loading />;
  }
  
  return (
    <View className="flex flex-1 items-center justify-center px-5">
      <Image
        source={require("@/assets/logo.png")}
        resizeMode="contain"
        className="h-8"
      />

      <Image source={require("@/assets/bg.png")} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e planeje sua {"\n"} próxima viagem!
      </Text>
      <View className="w-full bg-zinc-900 flex-col items-center justify-center rounded-xl p-4 my-8 border border-zinc-800">
        <Input>
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Para onde?"
            editable={stepForm === StepForm.TRIP_DETAILS}
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input>
          <CalendarIcon color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Quando?"
            editable={stepForm === StepForm.TRIP_DETAILS}
            onFocus={() => Keyboard.dismiss()}
            showSoftInputOnFocus={false}
            onPressIn={() =>
              stepForm === StepForm.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)
            }
            value={selectedDates.formatDatesInText}
          />
        </Input>
        {stepForm === StepForm.AT_EMAIL && (
          <>
            <View className="w-full border-b py-3 border-zinc-800">
              <Button
                variant="secondary"
                onPress={() => setStepForm(StepForm.TRIP_DETAILS)}
              >
                <Button.Title>Alterar local/hora</Button.Title>
                <Settings2 color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Quem esta na viagem?"
                autoCorrect={false}
                value={
                  emailsToInvite.length > 0
                    ? `${emailsToInvite.length} pessoa(s) convidada(s)`
                    : ""
                }
                onPressIn={() => {
                  Keyboard.dismiss();
                  setShowModal(MODAL.GUESTS);
                }}
                onFocus={() => Keyboard.dismiss()}
                showSoftInputOnFocus={false}
              />
            </Input>
          </>
        )}
        <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS
              ? "Continuar"
              : "Confirmar Viagem"}
          </Button.Title>
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao planejar sua viagem pela plann.er você automaticamente concorda com
        nossos{" "}
        <Text className="text-zinc-300 underline">
          termos de políticas e privacidade
        </Text>
      </Text>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ida e volta da viagem"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />

          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar convidados"
        subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem."
        onClose={() => setShowModal(MODAL.NONE)}
        visible={showModal === MODAL.GUESTS}
      >
        <View className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start">
          {emailsToInvite.length > 0 ? (
            emailsToInvite.map((email) => (
              <GuestEmail
                key={email}
                email={email}
                onRemove={() => handleRemoveEmail(email)}
              />
            ))
          ) : (
            <Text className="text-zinc-600 text-base font-regular">
              Nenhum email adcionado
            </Text>
          )}
        </View>
        <View className="gap-4 mt-4">
          <Input variant="secondary">
            <AtSign color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Digite o e-mail do convidado"
              keyboardType="email-address"
              onChangeText={(email) =>
                setEmailToInvite(email.toLocaleLowerCase())
              }
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddEmail}
            />
          </Input>
          <Button onPress={handleAddEmail}>
            <Button.Title>Convidar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
