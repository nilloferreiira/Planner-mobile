import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Modal } from "@/components/modal"
import { Participant, ParticipantProps } from "@/components/participant"
import { TripLink, TripLinkProps } from "@/components/tripLink"
import { linksServer } from "@/server/links-server"
import { participantsServer } from "@/server/participants-server"
import { colors } from "@/styles/colors"
import { validateInput } from "@/utils/validateInput"
import { Link2, Plus, Tag } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Alert, FlatList, Text, View } from "react-native"

export function Details({ tripId }: { tripId: string }) {
  //Loading
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false)
  const [isGettingtripLinks, setIsGettingtripLinks] = useState(true)

  //Modal
  const [showNewLinkModal, setShowNewLinkModal] = useState(false)

  // Lists
  const [links, setLinks] = useState<TripLinkProps[]>([])
  const [participants, setParticipants] = useState<ParticipantProps[]>([])
  //Data
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  function resetNewLinkFields() {
    setLinkTitle("")
    setLinkUrl("")
    setIsCreatingLinkTrip(false)
    setShowNewLinkModal(false)
  }

  async function handleCreateTripLink() {
    try {
      if (!linkTitle.trim() || !linkUrl.trim()) {
        return Alert.alert("Criar novo link", "Preencha todos os campos.")
      }

      if (!validateInput.url(linkUrl.trim())) {
        return Alert.alert("Link", "Link inválido.")
      }

      setIsCreatingLinkTrip(true)

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkUrl
      })

      resetNewLinkFields()
      await getTripLinks(tripId)
      return Alert.alert("Link", "Link criado com sucesso!.")
    } catch (error) {
      console.log(error)
    } finally {
      resetNewLinkFields()
    }
  }

  async function getTripLinks(tripId: string) {
    try {
      const tripLinks = await linksServer.getLinksByTripId(tripId)

      setLinks(tripLinks)
    } catch (error) {
      console.log(error)
    } finally {
      setIsGettingtripLinks(false)
    }
  }

  async function getTripParticipants(tripId: string) {
    try {
      const participants = await participantsServer.getByTripId(tripId)

      setParticipants(participants)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getTripLinks(tripId)
    getTripParticipants(tripId)
  }, [])

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links importantes
      </Text>

      <View className="gap-6">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum link adicionado.
          </Text>
        )}

        <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6 ">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>
        {participants.length > 0 ? (
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Participant data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum participante adicionado.
          </Text>
        )}
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes"
        visible={showNewLinkModal}
        onClose={() => setShowNewLinkModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Tag color={colors.zinc[200]} size={20} />
            <Input.Field
              placeholder="Título do link"
              onChangeText={setLinkTitle}
              value={linkTitle}
            />
          </Input>
          <Input variant="secondary">
            <Link2 color={colors.zinc[200]} size={20} />
            <Input.Field
              placeholder="URL"
              onChangeText={setLinkUrl}
              value={linkUrl}
            />
          </Input>
          <Button isLoading={isCreatingLinkTrip} onPress={handleCreateTripLink}>
            <Button.Title>Salvar link</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
