import { api, contentParser } from '@mindustry-tool/api';
import { ApiError } from '@mindustry-tool/api';
import { stripColors } from '@mindustry-tool/api';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, User } from 'discord.js';
import { ApiService } from 'src/api/api.service';

type SchematicData =
  | {
    type: 'base64';
    data: string;
  }
  | {
    type: 'file';
    file: Buffer;
  };

const EMOJI: Record<string, string> = {
  copper: '1417369527238393896',
  lead: '1417370023491797013',
  beryllium: '1417369882483363860',
  blastcompound: '1417369895280054272',
  carbide: '1417369943669870673',
  coal: '1417369961747316736',
  dormantcyst: '1417369975710290011',
  fissilematter: '1417369994018164786',
  graphite: '1417370008505421986',
  itemlead: '1417370023491797013',
  metaglass: '1417370041082712135',
  oxide: '1417370064650240171',
  phasefabric: '1417370111853072484',
  plastanium: '1417370145785118840',
  pyratite: '1417370170808336435',
  sand: '1417370249854058567',
  scrap: '1417370331789791355',
  silicon: '1417370351649816648',
  sporepod: '1417370365314727947',
  surgealloy: '1417370384088698960',
  thorium: '1417370398487609385',
  titanium: '1417370414182694953',
  tungsten: '1417370437691773059',
  arkycite: '1417370456314347520',
  cryofluid: '1417370472386924627',
  cyanogen: '1417370487658381352',
  gallium: '1417370503274041395',
  hydrogen: '1417370519988342794',
  neoplasm: '1417370541786136576',
  nitrogen: '1417370581426376734',
  oil: '1417370605245956106',
  zone: '1417370632227782786',
  slag: '1417370649768230972',
  water: '1417370665232891966',
  newhorizonancimembrane: '1417377140629831711',
  newhorizondarkenergy: '1417377166861275187',
  newhorizonfusioncoreenergy: '1417377190424743987',
  newhorizonhadronicomp: '1417377204584583209',
  newhorizonirayrondpanel: '1417377236306100274',
  newhorizonirdryonfluid: '1417377280589692941',
  newhorizonmetaloxhydrigen: '1417377300479217694',
  newhorizonmultiplesteel: '1417377317407424592',
  newhorizonnodexplate: '1417377334436171786',
  newhorizonpresstanium: '1417377349485334568',
  newhorizonprocessorhyper: '1417377364027113472',
  newhorizonprocessorjunior: '1417377383576633456',
  newhorizonprocessorsenior: '1417377398252503140',
  newhorizonquantumliquid: '1417377424488009819',
  newhorizonsetonalloy: '1417377440552063016',
  newhorizonthermocorenegative: '1417377456331165777',
  newhorizonthermocorepositive: '1417377471170482206',
  newhorizonxenfluid: '1417377484315430982',
  newhorizonzeta: '1417377498462687283',
  newhorizonzetafluidnegative: '1417377510345146368',
  newhorizonzetafluidpositive: '1417377522865148006',
};
async function findUserById(id: string, apiService: ApiService) {
  const [res, error] = await apiService.apiV4Instance.tryRequest(api.v4.users.getByDiscordId, {
    params: {
      id,
    },
  });

  if (res) {
    return res;
  }

  if (error instanceof ApiError && error.response.status === 404) {
    return null;
  }

  throw error;
}

export async function generateSchematicEmbed(
  schematic: SchematicData,
  user: User,
  apiService: ApiService,
  options?: { includeFile?: boolean },
) {
  const formData = new FormData();
  const data = schematic.type === 'file' ? schematic.file : Buffer.from(schematic.data, 'base64');
  const base64 = schematic.type === 'file' ? schematic.file.toString('base64') : schematic.data;
  // Default: include file for base64 input, exclude for file input
  const includeFile = options?.includeFile ?? schematic.type === 'base64';

  formData.append('data', new Blob([data as BlobPart]));

  const [image, preview, apiUser] = await Promise.all([
    apiService.contentParserInstance.request(contentParser.v2.schematics.image, {
      body: formData,
      responseType: 'buffer',
    }),
    apiService.contentParserInstance.request(contentParser.v2.schematics.preview, {
      body: formData,
    }),
    findUserById(user.id, apiService),
  ]);

  const embed = new EmbedBuilder();

  // Build description with title and content
  let description = '';
  if (preview.name) {
    description += `### ${stripColors(preview.name)}\n`;
  }
  if (preview.description) {
    description += `${stripColors(preview.description)}\n\n`;
  }

  // Add login status
  if (apiUser) {
    description += `-# Logged as **${apiUser.name}**`;
  } else {
    description += `-# Not logged — log in [here](https://mindustry-tool.com)`;
  }

  embed.setDescription(description);
  embed.setColor(0xFFA500); // Orange/Amber color for schematics

  embed
    .setAuthor({
      name: user.displayName,
      iconURL: user.displayAvatarURL(),
    })
    .addFields(
      {
        name: 'Size',
        value: `${preview.width}x${preview.height}`,
        inline: true,
      },
      {
        name: 'Power',
        value: (() => {
          const balance = preview.meta.powerProduction - preview.meta.powerConsumption;
          return balance >= 0 ? `+${balance}` : `${balance}`;
        })(),
        inline: true,
      },
      {
        name: 'Requirement',
        value:
          preview.meta.requirements
            .map((req) => `<:${req.name.replaceAll('-', '')}:${EMOJI[req.name.replaceAll('-', '')]}> ${req.amount}`)
            .join(' ') || 'None',
        inline: false,
      },
    )
    .setImage('attachment://preview.png');

  const attachments = [
    new AttachmentBuilder(Buffer.from(image), {
      name: 'preview.png',
    }),
  ];

  // Add schematic file if requested (for base64 text input)
  if (includeFile) {
    attachments.push(
      new AttachmentBuilder(data, {
        name: stripColors(preview.name).replace(/\s+/g, '-') + '.msch',
      }),
    );
  }

  const uploadData = apiUser
    ? { base64, fileType: 'msch' as const, userId: apiUser.id, discordUserId: user.id }
    : null;

  return { embed, attachments, uploadData } as const;
}

export async function generateMapEmbed(
  map: Buffer,
  user: User,
  apiService: ApiService,
) {
  const formData = new FormData();
  formData.append('data', new Blob([map as BlobPart]));

  const base64 = map.toString('base64');

  const [image, preview, apiUser] = await Promise.all([
    apiService.contentParserInstance.request(contentParser.v2.maps.image, {
      body: formData,
      responseType: 'buffer',
    }),
    apiService.contentParserInstance.request(contentParser.v2.maps.preview, {
      body: formData,
    }),
    findUserById(user.id, apiService),
  ]);

  const embed = new EmbedBuilder();

  // Build description with title and content
  let description = '';
  if (preview.name) {
    description += `### ${stripColors(preview.name)}\n`;
  }
  if (preview.description) {
    description += `${stripColors(preview.description)}\n\n`;
  }

  // Add login status
  if (apiUser) {
    description += `-# Logged as **${apiUser.name}**`;
  } else {
    description += `-# Not logged — log in [here](https://mindustry-tool.com)`;
  }

  embed.setDescription(description);
  embed.setColor(0xFAB01B); // Gold/Amber color for maps

  embed
    .setAuthor({
      name: user.displayName,
      iconURL: user.displayAvatarURL(),
    })
    .addFields(
      {
        name: 'Author',
        value: stripColors(preview.author) || 'Unknown',
        inline: true,
      },
      {
        name: 'Size',
        value: `${preview.width}x${preview.height}`,
        inline: true,
      },
    )
    .setImage('attachment://preview.png');

  const attachments = [
    new AttachmentBuilder(Buffer.from(image), {
      name: 'preview.png',
    }),
  ];

  const uploadData = apiUser
    ? { base64, fileType: 'msav' as const, userId: apiUser.id, discordUserId: user.id }
    : null;

  return { embed, attachments, uploadData } as const;
}

export function createUploadButton(uploadId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`upload/${uploadId}`)
      .setLabel('Upload to Mindustry Tool')
      .setStyle(ButtonStyle.Success),
  );
}
